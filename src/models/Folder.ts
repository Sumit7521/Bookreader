import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId;
  type: 'library' | 'writing';
  libraryFolderType?: 'genre' | 'author' | 'series' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Folder' },
    type: { type: String, enum: ['library', 'writing'], required: true },
    libraryFolderType: { type: String, enum: ['genre', 'author', 'series', 'custom'] },
  },
  {
    timestamps: true,
  }
);

FolderSchema.index({ userId: 1 });
FolderSchema.index({ parentId: 1 });

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);

export default Folder;
