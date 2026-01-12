import type { Request, Response } from "express";
import { Gig } from "../model/gig.js";
import TryCatch from "../tryCatch.js";

export const getGigs = TryCatch(async (_req: Request, res: Response) => {
    const gigs = await Gig.find({ status: 'open' })
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 });
    return res.json(gigs);
});

export const createGig = TryCatch(async (req: Request, res: Response) => {
    
    const { title, description, budget } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const ownerId = req.user.id;

    const budgetNumber = typeof budget === 'number' ? budget : Number(budget);

    if (!title || budgetNumber === undefined || Number.isNaN(budgetNumber)) {
        return res.status(400).json({ message: 'Title and budget are required' });
    }

    if (budgetNumber <= 0) {
        return res.status(400).json({ message: 'Budget must be greater than 0' });
    }

    const newGig = new Gig({
        title,
        description,
        budget: budgetNumber,
        ownerId,
        status: 'open'
    });

    await newGig.save();
    return res.status(201).json(newGig);
});

