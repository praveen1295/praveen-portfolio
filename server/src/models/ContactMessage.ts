import mongoose, { Document, Schema } from 'mongoose';

export type MessageStatus = 'NEW' | 'READ' | 'REPLIED';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  replySubject: string;
  replyBody: string;
  repliedAt: Date | null;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['NEW', 'READ', 'REPLIED'], default: 'NEW' },
    replySubject: { type: String, default: '' },
    replyBody: { type: String, default: '' },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);
