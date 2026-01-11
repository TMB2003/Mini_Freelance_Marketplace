import express from "express";
import { login, register } from "./controller/register.js";
import { getGigs, createGig } from "./controller/gig.js";
import { createBid, getGigBids, hireBid } from "./controller/bid.js";

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Gig routes
router.get('/api/gigs', getGigs);
router.post('/api/gigs', createGig);

// Bid routes
router.post('/api/bids', createBid);
router.get('/api/bids/:gigId', getGigBids);
router.patch('/api/bids/:bidId/hire', hireBid);

export default router;