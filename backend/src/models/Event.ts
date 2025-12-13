import mongoose, { Schema, Document } from "mongoose";

export type EventType = "session_start" | "page_visit" | "add_to_cart" | "purchase" | "search";

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  userIdRaw?: number; // optional numeric userId from your mock data
  sessionId: mongoose.Types.ObjectId;
  eventType: EventType;
  page?: string;
  timestamp: Date;
  durationSec?: number;
  device?: string;
  country?: string;
  metadata?: Record<string, any>;
}

const EventSchema = new Schema<IEvent>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  userIdRaw: { type: Number },
  sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventType: { type: String, required: true, index: true },
  page: { type: String },
  timestamp: { type: Date, required: true, index: true },
  durationSec: { type: Number },
  device: { type: String, index: true },
  country: { type: String, index: true },
  metadata: { type: Schema.Types.Mixed },
});

// Compound index for typical queries: by user and time desc
EventSchema.index({ userId: 1, timestamp: -1 });
EventSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model<IEvent>("Event", EventSchema);
