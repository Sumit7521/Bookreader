import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWritingProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  synopsis?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  folderId?: mongoose.Types.ObjectId;
  category: 'Novels' | 'Short Stories' | 'Poetry' | 'Drafts' | 'Custom';
  createdAt: Date;
  updatedAt: Date;
}

const WritingProjectSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    synopsis: { type: String },
    coverImage: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
    category: { type: String, enum: ['Novels', 'Short Stories', 'Poetry', 'Drafts', 'Custom'], default: 'Drafts' },
  },
  {
    timestamps: true,
  }
);

WritingProjectSchema.index({ userId: 1, updatedAt: -1 });

const WritingProject: Model<IWritingProject> = mongoose.models.WritingProject || mongoose.model<IWritingProject>('WritingProject', WritingProjectSchema);

export default WritingProject;
