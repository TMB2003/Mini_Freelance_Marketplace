import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatMessage extends Document {
  gigId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { timestamps: true },
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
