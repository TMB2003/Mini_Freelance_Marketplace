import type { Request, Response } from "express";
import { Gig } from "../model/gig.js";
import TryCatch from "../tryCatch.js";

export const getGigs = TryCatch(async (req: Request, res: Response) => {
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
    const query: {
        status: string;
        $or?: Array<{
            [key: string]: { $regex: string; $options: string };
        }>;
    } = { status: 'open' };
        
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const gigs = await Gig.find(query).sort({ createdAt: -1 });
    return res.json(gigs);
});

export const createGig = TryCatch(async (req: Request, res: Response) => {
    
    const { title, description, budget } = req.body;
        
    const ownerId = (req as any).user?.id;

    if (!title || !budget) {
        return res.status(400).json({ message: 'Title and budget are required' });
    }

    const newGig = new Gig({
        title,
        description,
        budget,
        ownerId,
        status: 'open'
    });

    await newGig.save();
    return res.status(201).json(newGig);
});

