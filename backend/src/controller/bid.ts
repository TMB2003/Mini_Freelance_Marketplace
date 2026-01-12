import mongoose, { Types } from "mongoose";
import { Bid } from "../model/bid.js";
import { Gig } from "../model/gig.js";
import TryCatch from "../tryCatch.js";
import { getIO } from "../socket.js";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export const createBid = TryCatch(async(req, res) => {
    const { gigId, message, amount } = req.body;
        
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
        
    const freelancerId = req.user.id;

    if (!gigId || !message) {
        return res.status(400).json({ message: 'Gig ID and message are required' });
    }

    const amountNumber = amount === undefined ? undefined : (typeof amount === 'number' ? amount : Number(amount));
    if (amountNumber !== undefined && (Number.isNaN(amountNumber) || amountNumber < 0)) {
        return res.status(400).json({ message: 'Bid amount cannot be negative' });
    }

    if (!Types.ObjectId.isValid(gigId)) {
        return res.status(400).json({ message: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
        return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
        return res.status(400).json({ message: 'This gig is not accepting bids' });
    }

    const existingBid = await Bid.findOne({ 
        gigId: new Types.ObjectId(gigId), 
        freelancerId: new Types.ObjectId(freelancerId) 
    });
    if (existingBid) {
        return res.status(400).json({ message: 'You have already placed a bid on this gig' });
    }

    const newBid = new Bid({
        gigId: new Types.ObjectId(gigId),
        freelancerId: new Types.ObjectId(freelancerId),
        message,
        amount: amountNumber,
        status: 'pending' as const
    });

    await newBid.save();
    return res.status(201).json(newBid);
});

export const getGigBids = TryCatch(async (req, res) => {
    const { gigId } = req.params;
        
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
        
    const userId = req.user.id;

    if (!Types.ObjectId.isValid(gigId as string)) {
        return res.status(400).json({ message: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
        return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== userId) {
       return res.status(403).json({ message: 'Not authorized to view these bids' });
    }

    const bids = await Bid.find({ gigId: new Types.ObjectId(gigId as string) })
    .populate('freelancerId', 'name email');
    return res.json(bids);
});

export const hireBid = TryCatch(async (req, res) => {
    const { bidId } = req.params;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.user.id;

    if (!Types.ObjectId.isValid(bidId as string)) {
        return res.status(400).json({ message: 'Invalid bid ID format' });
    }

    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            // Find the bid and lock it for updates
            const bid = await Bid.findById(bidId)
                .populate({
                    path: 'gigId',
                    // Lock the gig document for updates
                    options: { session, new: true, readConcern: { level: 'majority' }, writeConcern: { w: 'majority' } }
                })
                .session(session)
                .exec();

            if (!bid) {
                throw new Error('Bid not found');
            }

            const gig = bid.gigId as any;

            // Verify ownership
            if (gig.ownerId.toString() !== userId) {
                throw new Error('Not authorized to hire for this gig');
            }

            // Check if gig is still open
            if (gig.status !== 'open') {
                throw new Error('This gig is not open for hiring');
            }

            // Check if the bid is still pending
            if (bid.status !== 'pending') {
                throw new Error('This bid is no longer available for hiring');
            }

            // Update the bid status to hired
            bid.status = 'hired';
            await bid.save({ session });

            // Update the gig status and set the hired freelancer
            gig.status = 'assigned';
            gig.hiredFreelancerId = bid.freelancerId;
            await gig.save({ session });

            // Reject all other pending bids for this gig
            await Bid.updateMany(
                { 
                    gigId: gig._id,
                    status: 'pending',
                    _id: { $ne: bid._id }
                },
                { status: 'rejected' },
                { session }
            );

            return { bid, gig };
        });

        // If we get here, the transaction was successful
        const updatedBid = await Bid.findById(bidId)
            .populate('gigId', 'title status')
            .populate('freelancerId', 'name email')
            .lean();

        try {
            const gig = updatedBid?.gigId as any;
            const freelancer = updatedBid?.freelancerId as any;

            const freelancerId = typeof freelancer === 'string' ? freelancer : freelancer?._id;
            const gigTitle = typeof gig === 'string' ? undefined : gig?.title;

            if (freelancerId) {
                getIO().to(`user:${freelancerId}`).emit('hired', {
                    gigId: typeof gig === 'string' ? gig : gig?._id,
                    gigTitle: gigTitle ?? 'a project',
                });
            }
        } catch {
            // ignore socket errors
        }

        return res.json({ 
            message: 'Freelancer hired successfully',
            bid: updatedBid
        });

    } catch (error: any) {
        // If we get here, the transaction was aborted
        await session.abortTransaction();
        
        const statusCode = error.message.includes('Not authorized') ? 403 : 
                          error.message.includes('not found') ? 404 : 
                          error.message.includes('not open') ? 400 : 500;
        
        return res.status(statusCode).json({ 
            message: error.message || 'Error processing hire request' 
        });
    } finally {
        await session.endSession();
    }
});