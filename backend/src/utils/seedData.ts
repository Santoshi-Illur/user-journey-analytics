// src/seed/seedData.ts
import mongoose from "mongoose";
import User from "../models/User";
import Session from "../models/Session";
import Event from "../models/Event";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

// ------------------------------------------------------
// CONFIG
// ------------------------------------------------------
const MONGO_URI = "mongodb://127.0.0.1:27017/user-journey-analytics";

const USER_COUNT = 500;
const EVENTS_TOTAL = 100_000;

const devices = ["Desktop", "Mobile", "Tablet"];
const countries = ["India", "USA", "UK", "Germany", "Canada"];

const pages = [
  "Home",
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Checkout",
  "Product",
];

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

const randomOf = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ------------------------------------------------------
// MAIN SEED FUNCTION
// ------------------------------------------------------
async function runSeed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🔥 Clearing existing collections...");
    await User.deleteMany({});
    await Session.deleteMany({});
    await Event.deleteMany({});

    // ------------------------------------------------------
    // 1) Create USERS
    // ------------------------------------------------------
    console.log(`👤 Creating ${USER_COUNT} users...`);

    const passwordHash = await bcrypt.hash("password123", 10);
    const users = [];

    for (let i = 1; i <= USER_COUNT; i++) {
      users.push({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        passwordHash,
        device: randomOf(devices),
        country: randomOf(countries),
        createdAt: new Date(),
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log("✔ Users inserted.");

    // ------------------------------------------------------
    // 2) Create SESSIONS + EVENTS
    // ------------------------------------------------------
    const allEvents: any[] = [];
    const allSessions: any[] = [];

    console.log(`📌 Generating ~${EVENTS_TOTAL} events across sessions...`);

    for (const user of createdUsers) {
      // 3–6 sessions per user
      const sessionCount = randomInt(3, 6);

      for (let s = 0; s < sessionCount; s++) {
        const sessionStart = dayjs().subtract(randomInt(0, 30), "day").toDate();
        const sessionDoc = {
          userId: user._id,
          persona: null,
          sessionStart,
          createdAt: new Date(),
        };

        allSessions.push(sessionDoc);
      }
    }

    const createdSessions = await Session.insertMany(allSessions);
    console.log(`✔ Sessions created: ${createdSessions.length}`);

    // ------------------------------------------------------
    // Build EVENTS
    // ------------------------------------------------------
    let eventCounter = 0;

    for (const session of createdSessions) {
      const evCount = randomInt(10, 30); // 10–30 events per session
      let currentTime = dayjs(session.sessionStart);

      for (let i = 0; i < evCount; i++) {
        if (eventCounter >= EVENTS_TOTAL) break;

        const type: string = randomOf(eventTypes);
        const duration = randomInt(5, 60);

        const event = {
          userId: session.userId,
          sessionId: session._id,
          userIdRaw: null,
          eventType: type,
          page: randomOf(pages),
          timestamp: currentTime.toDate(),
          durationSec: type === "page_visit" ? duration : randomInt(5, 15),
          device: randomOf(devices),
          country: randomOf(countries),
          metadata: {},
        };

        allEvents.push(event);

        // Move time ahead for next event
        currentTime = currentTime.add(randomInt(1, 30), "minute");

        eventCounter++;
      }
    }

    console.log(`📦 Inserting ${allEvents.length} events into DB...`);
    await Event.insertMany(allEvents);

    console.log("🎉 SEED COMPLETE!");
    console.log("Users:", createdUsers.length);
    console.log("Sessions:", createdSessions.length);
    console.log("Events:", allEvents.length);

    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR:", err);
    process.exit(1);
  }
}

runSeed();
