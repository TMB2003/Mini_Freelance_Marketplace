import type { Request, Response } from "express";
import { Gig } from "../model/gig.js";
import TryCatch from "../tryCatch.js";

export const getGigs = TryCatch(async (req: Request, res: Response) => {
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
    const minBudgetRaw = typeof req.query['minBudget'] === 'string' ? req.query['minBudget'] : undefined;
    const maxBudgetRaw = typeof req.query['maxBudget'] === 'string' ? req.query['maxBudget'] : undefined;

    const minBudget = minBudgetRaw !== undefined ? Number(minBudgetRaw) : undefined;
    const maxBudget = maxBudgetRaw !== undefined ? Number(maxBudgetRaw) : undefined;

    const query: {
        status: string;
        title?: { $regex: string; $options: string };
        budget?: { $gte?: number; $lte?: number };
    } = { status: 'open' };
        
    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }

    if (minBudget !== undefined && !Number.isNaN(minBudget)) {
        query.budget = { ...(query.budget ?? {}), $gte: minBudget };
    }

    if (maxBudget !== undefined && !Number.isNaN(maxBudget)) {
        query.budget = { ...(query.budget ?? {}), $lte: maxBudget };
    }

    const gigs = await Gig.find(query)
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

