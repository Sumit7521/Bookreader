import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  pageNumber: number;
  label?: string;
  type: 'bookmark' | 'last_read';
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    pageNumber: { type: Number, required: true },
    label: { type: String },
    type: { type: String, enum: ['bookmark', 'last_read'], required: true },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ userId: 1, bookId: 1, type: 1 });

const Bookmark: Model<IBookmark> = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
