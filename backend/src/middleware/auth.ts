import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    try {
        const secret = process.env["JWT_SECRET"];
        if (!secret) {
            return res.status(500).json({ message: "JWT secret not configured" });
        }

        const decoded = jwt.verify(token, secret) as { id?: string };
        if (!decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = { id: decoded.id };
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
