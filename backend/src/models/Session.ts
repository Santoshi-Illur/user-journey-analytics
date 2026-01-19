// src/models/Session.ts
import { string } from "joi";
import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  persona?: string;
  sessionStart: Date;
  sessionEnd?: Date;
  eventCount?: number;
  createdAt: Date;
  
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  persona: { type: String },
  sessionStart: { type: Date, required: true, index: true },
  sessionEnd: { type: Date },
  eventCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() }
  
});

SessionSchema.index({ userId: 1, sessionStart: -1 });

export default mongoose.model<ISession>("Session", SessionSchema);
