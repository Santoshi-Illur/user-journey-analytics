import mongoose from "mongoose";
import dayjs from "dayjs";
import User from "../models/User";
import Event from "../models/Event";
import { MONGO_URI } from "../config";
import bcrypt from "bcryptjs";

const sampleUsers = [
  // include 20 realistic user objects with userId (numeric), name, email, device, country, sessionStart, pagesVisited, purchaseCount, timeOnPage, events array
  {
    userIdRaw: 101,
    name: "John Doe",
    email: "john.doe@example.com",
    device: "Desktop",
    country: "USA",
    sessionStart: "2025-11-27 09:30",
    pagesVisited: 9,
    purchaseCount: 1,
    timeOnPage: 120,
    events: [
      { event: "page_visit", page: "Home", time: "09:30", duration: 10 },
      { event: "page_visit", page: "Search", time: "09:40", duration: 20 },
      { event: "add_to_cart", page: "Product 101", time: "09:55", duration: 5 },
      { event: "purchase", page: "Checkout", time: "10:00", duration: 15 },
    ],
  },
  // ... add 19 more realistic records; for brevity you can generate programmatically
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("connected");

  // wipe for seed (be careful in prod)
  await User.deleteMany({});
  await Event.deleteMany({});

  for (const u of sampleUsers) {
    const passwordHash = await bcrypt.hash("password123", 10);
    const userDoc = await User.create({ name: u.name, email: u.email, passwordHash, device: u.device, country: u.country });
    const baseDate = u.sessionStart.split(" ")[0]; // "YYYY-MM-DD"
    const events = u.events.map((ev: any) => ({
      userId: userDoc._id,
      userIdRaw: u.userIdRaw,
      eventType: ev.event,
      page: ev.page,
      timestamp: new Date(`${baseDate} ${ev.time}`),
      durationSec: ev.duration,
      device: u.device,
      country: u.country,
      metadata: {},
    }));
    await Event.insertMany(events);
  }

  console.log("seed complete");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
