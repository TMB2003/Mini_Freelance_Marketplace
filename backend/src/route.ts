import express from "express";
import { login, register } from "./controller/register.js";
import { getGigs, createGig } from "./controller/gig.js";
import { createBid, getGigBids, hireBid } from "./controller/bid.js";
import { requireAuth } from "./middleware/auth.js";

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Gig routes
router.get('/gigs', getGigs);
router.post('/gigs', requireAuth, createGig);

// Bid routes
router.post('/bids', requireAuth, createBid);
router.get('/bids/:gigId', requireAuth, getGigBids);
router.patch('/bids/:bidId/hire', requireAuth, hireBid);

export default router;