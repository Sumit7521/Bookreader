import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  rating: number;
  content?: string;
  plotSummary?: string;
  keyTakeaways?: string;
  favoriteQuotes?: string;
  characterNotes?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    content: { type: String },
    plotSummary: { type: String },
    keyTakeaways: { type: String },
    favoriteQuotes: { type: String },
    characterNotes: { type: String },
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ userId: 1, bookId: 1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
