import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChapter extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'WritingProject', required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, required: true },
    wordCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.index({ projectId: 1, order: 1 });

const Chapter: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);

export default Chapter;
