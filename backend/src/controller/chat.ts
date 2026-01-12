import { Types } from 'mongoose';
import { Gig } from '../model/gig.js';
import { ChatMessage } from '../model/chatMessage.js';
import TryCatch from '../tryCatch.js';

export const getChatGigs = TryCatch(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = req.user.id;

  const gigs = await Gig.find({
    status: 'assigned',
    $or: [{ ownerId: new Types.ObjectId(userId) }, { hiredFreelancerId: new Types.ObjectId(userId) }],
  })
    .populate('ownerId', 'name email')
    .populate('hiredFreelancerId', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

  return res.json(gigs);
});

export const getGigMessages = TryCatch(async (req, res) => {
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

  const ownerId = gig.ownerId.toString();
  const hiredId = gig.hiredFreelancerId?.toString();

  if (gig.status !== 'assigned' || !hiredId) {
    return res.status(400).json({ message: 'This gig is not available for chat' });
  }

  if (ownerId !== userId && hiredId !== userId) {
    return res.status(403).json({ message: 'Not authorized to view this chat' });
  }

  const messages = await ChatMessage.find({ gigId: new Types.ObjectId(gigId as string) })
    .populate('senderId', 'name email')
    .sort({ createdAt: 1 })
    .lean();

  const normalized = messages.map((m: any) => ({
    ...m,
    gigId: typeof m.gigId === 'string' ? m.gigId : m.gigId?.toString?.() ?? m.gigId,
  }));

  return res.json(normalized);
});
