import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReadingSession extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  pagesRead?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    pagesRead: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ReadingSessionSchema.index({ userId: 1, bookId: 1 });

const ReadingSession: Model<IReadingSession> = mongoose.models.ReadingSession || mongoose.model<IReadingSession>('ReadingSession', ReadingSessionSchema);

export default ReadingSession;
