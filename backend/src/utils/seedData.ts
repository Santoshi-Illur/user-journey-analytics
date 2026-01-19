// src/seed/seedData.ts
import mongoose from "mongoose";
import User from "../models/User";
import Session from "../models/Session";
import Event from "../models/Event";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

/* ------------------------------------------------------
   CONFIG
------------------------------------------------------ */
const MONGO_URI = "mongodb://127.0.0.1:27017/user-journey-analytics";

const USER_COUNT = 10000;
const EVENTS_TOTAL = 100000;

const devices = ["Desktop", "Mobile", "Tablet"] as const;
const countries = ["India", "USA", "UK", "Germany", "Canada"] as const;

const pages = [
  "Home",
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Checkout",
  "Product",
] as const;

const eventTypes = [
  "session_start",
  "page_visit",
  "product_view",
  "search",
  "add_to_cart",
  "checkout",
  "purchase",
] as const;

type EventType = (typeof eventTypes)[number];

/* ------------------------------------------------------
   PURCHASE TYPES & CATALOG
------------------------------------------------------ */
type PurchaseItem = {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
};

const PRODUCT_CATALOG = [
  { name: "Wireless Mouse", category: "Electronics", min: 499, max: 1499 },
  { name: "Bluetooth Headphones", category: "Electronics", min: 1999, max: 5999 },
  { name: "Laptop Backpack", category: "Accessories", min: 999, max: 2999 },
  { name: "Smart Watch", category: "Wearables", min: 2999, max: 9999 },
  { name: "USB-C Charger", category: "Electronics", min: 699, max: 1999 },
  { name: "Running Shoes", category: "Footwear", min: 2499, max: 6999 },
  { name: "T-Shirt", category: "Clothing", min: 399, max: 1299 },
  { name: "Office Chair", category: "Furniture", min: 4999, max: 15999 },
];

/* ------------------------------------------------------
   UTILS
------------------------------------------------------ */
const randomOf = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generatePurchaseItems = (): PurchaseItem[] => {
  const itemCount = randomInt(1, 4);
  const items: PurchaseItem[] = [];

  for (let i = 0; i < itemCount; i++) {
    const product = randomOf(PRODUCT_CATALOG);
    const quantity = randomInt(1, 3);
    const price = randomInt(product.min, product.max);

    items.push({
      productId: `prod_${Math.random().toString(36).slice(2, 10)}`,
      productName: product.name,
      category: product.category,
      price,
      quantity,
      total: price * quantity,
    });
  }

  return items;
};

/* ------------------------------------------------------
   MAIN SEED FUNCTION
------------------------------------------------------ */
async function runSeed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    // console.log("🔥 Clearing existing data...");
    // await User.deleteMany({});
    // await Session.deleteMany({});
    // await Event.deleteMany({});

    /* ---------------- USERS ---------------- */
    console.log(`👤 Creating ${USER_COUNT} users...`);
    const passwordHash = await bcrypt.hash("password123", 10);

    let getCurrentUserCount = (await User.countDocuments())+1;

    console.log("getCurrentUserCount", getCurrentUserCount);

    const users = Array.from({ length: USER_COUNT }, (_, i) => ({
      name: `User ${getCurrentUserCount + i + 1}`,
      email: `user${getCurrentUserCount + i + 1}@example.com`,
      passwordHash,
      device: randomOf(devices),
      country: randomOf(countries),
      createdAt: new Date(),
    }));

    const createdUsers = await User.insertMany(users);
    console.log("✔ Users inserted");

    /* ---------------- SESSIONS ---------------- */
    console.log("📌 Creating sessions...");
    const allSessions: any[] = [];

    for (const user of createdUsers) {
      const sessionCount = randomInt(3, 6);

      for (let i = 0; i < sessionCount; i++) {
        allSessions.push({
          userId: user._id,
          persona: null,
          sessionStart: dayjs().subtract(randomInt(0, 30), "day").toDate(),
          createdAt: new Date(),
        });
      }
    }

    const createdSessions = await Session.insertMany(allSessions);
    console.log(`✔ Sessions created: ${createdSessions.length}`);

    /* ---------------- EVENTS ---------------- */
    console.log("📦 Generating events...");
    const allEvents: any[] = [];
    let eventCounter = 0;

    for (const session of createdSessions) {
      const evCount = randomInt(10, 30);
      let currentTime = dayjs(session.sessionStart);

      for (let i = 0; i < evCount; i++) {
        if (eventCounter >= EVENTS_TOTAL) break;

        const type: EventType = randomOf(eventTypes);
        const duration = randomInt(5, 60);

        const event: any = {
          userId: session.userId,
          sessionId: session._id,
          userIdRaw: null,
          eventType: type,
          page: randomOf(pages),
          timestamp: currentTime.toDate(),
          durationSec:
            type === "page_visit" || type === "product_view"
              ? duration
              : undefined,
          device: randomOf(devices),
          country: randomOf(countries),
        };

        if (type === "purchase") {
          const items = generatePurchaseItems();

          event.purchase = {
            currency: "INR",
            paymentMethod: randomOf([
              "UPI",
              "Credit Card",
              "Debit Card",
              "Net Banking",
              "Wallet",
            ]),
            totalAmount: items.reduce((sum, i) => sum + i.total, 0),
            items,
          };
        } else {
          event.metadata = {
            referrer: randomOf(pages),
            scrollDepth: randomInt(10, 100),
          };
        }

        allEvents.push(event);
        currentTime = currentTime.add(randomInt(1, 30), "minute");
        eventCounter++;
      }
    }

    await Event.insertMany(allEvents);

    /* ---------------- DONE ---------------- */
    console.log("🎉 SEED COMPLETE!");
    console.log("Users:", createdUsers.length);
    console.log("Sessions:", createdSessions.length);
    console.log("Events:", allEvents.length);

    process.exit(0);
  } catch (error) {
    console.error("❌ SEED ERROR:", error);
    process.exit(1);
  }
}

runSeed();
