import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnotation extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  pageNumber: number;
  type: 'highlight' | 'margin';
  selectedText?: string;
  color?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    pageNumber: { type: Number, required: true },
    type: { type: String, enum: ['highlight', 'margin'], required: true },
    selectedText: { type: String },
    color: { type: String },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

AnnotationSchema.index({ userId: 1, bookId: 1, pageNumber: 1 });

const Annotation: Model<IAnnotation> = mongoose.models.Annotation || mongoose.model<IAnnotation>('Annotation', AnnotationSchema);

export default Annotation;
