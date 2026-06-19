import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  theme: 'light' | 'dark' | 'sepia' | 'system';
  fontSize: string;
  fontFamily: string;
  accentColor: string;
  backgroundImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark', 'sepia', 'system'], default: 'system' },
    fontSize: { type: String, default: 'medium' },
    fontFamily: { type: String, default: 'sans' },
    accentColor: { type: String, default: '#f59e0b' },
    backgroundImage: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
