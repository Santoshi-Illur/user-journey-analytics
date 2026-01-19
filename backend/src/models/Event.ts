
import mongoose, { Schema, Document } from "mongoose";

export type EventType = "session_start" | "page_visit" | "add_to_cart" | "purchase" | "search";


export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  userIdRaw?: number;            // legacy numeric userId
  sessionId: mongoose.Types.ObjectId;
  eventType: EventType;
  page?: string;
  timestamp: Date;
  durationSec?: number;
  device?: string;
  country?: string;
  /* ✅ Only populated for purchase events */
  purchase?: PurchaseData;
  /* ✅ Remains flexible for other event-specific data */
  metadata?: Record<string, any>;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  category: string;
  price: number;     // per unit
  quantity: number;
  total: number;     // price * quantity
}

export interface PurchaseData {
  currency: string;
  paymentMethod: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Wallet";
  totalAmount: number;
  items: PurchaseItem[];
}

const PurchaseItemSchema = new Schema(
  {
    productId: String,
    productName: String,
    category: String,
    price: Number,
    quantity: Number,
    total: Number
  },
  { _id: false }
);

const PurchaseSchema = new Schema(
  {
    currency: {
      type: String,
      default: "INR"
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"]
    },

    totalAmount: {
      type: Number,
      required: true
    },

    items: {
      type: [PurchaseItemSchema],
      required: true
    }
  },
  { _id: false }
);

/* ---------------- Event Schema ---------------- */
const EventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    userIdRaw: Number,

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true
    },

    eventType: {
      type: String,
      required: true,
      index: true
    },

    page: String,

    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },

    durationSec: Number,
    device: String,
    country: String,

    /* ✅ Purchase only when eventType === 'purchase' */
    purchase: {
      type: PurchaseSchema,
      required: function () {
        return this.eventType === "purchase";
      }
    },

    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    versionKey: false
  }
);

// // Compound index for typical queries: by user and time desc
// EventSchema.index({ userId: 1, timestamp: -1 });
//  EventSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model<IEvent>("Event", EventSchema);
