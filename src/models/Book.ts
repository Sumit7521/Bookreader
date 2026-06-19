import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBook extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  author?: string;
  coverImage?: string;
  fileUrl?: string;
  filePublicId?: string;
  status: 'not_started' | 'reading' | 'finished' | 'dnf';
  folderId?: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String },
    coverImage: { type: String },
    fileUrl: { type: String },
    filePublicId: { type: String },
    status: { type: String, enum: ['not_started', 'reading', 'finished', 'dnf'], default: 'not_started' },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ userId: 1, createdAt: -1 });

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;
