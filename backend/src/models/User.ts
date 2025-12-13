import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  device?: string;
  country?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  device: { type: String },
  country: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

export default mongoose.model<IUser>("User", UserSchema);
