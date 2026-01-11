import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBid extends Document {
    gigId: Types.ObjectId;
    freelancerId: Types.ObjectId;
    message: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const bidSchema = new Schema<IBid>({
    gigId: {
        type: Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export const Bid = mongoose.model<IBid>('Bid', bidSchema);