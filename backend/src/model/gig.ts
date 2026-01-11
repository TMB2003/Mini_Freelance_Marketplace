import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGig extends Document {
    title: string;
    description?: string;
    budget: string;
    ownerId: Types.ObjectId;
    hiredFreelancerId?: Types.ObjectId;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const gigSchema = new Schema<IGig>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    budget: {
        type: String,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hiredFreelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'cancelled'],
        default: 'open'
    }
}, {
    timestamps: true
});

export const Gig = mongoose.model<IGig>('Gig', gigSchema);