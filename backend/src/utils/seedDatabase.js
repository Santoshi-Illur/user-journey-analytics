// seedDatabase.js
// Full MongoDB Seeder: Users + Sessions + Events (Funnel-aware & Realistic)
// ---------------------------------------------------------------

const { MongoClient, ObjectId } = require("mongodb");
const dayjs = require("dayjs");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "user-journey-analytics";

// Config
const NUM_USERS = 500;
const NUM_SESSIONS = 2000; // total across all users
const TOTAL_EVENTS = 100000;

// Personas
const PERSONAS = [
  { type: "browser", weight: 30 },             // visits pages only
  { type: "researcher", weight: 25 },          // many searches
  { type: "impulse_buyer", weight: 15 },       // quick purchase
  { type: "cart_abandoner", weight: 20 },      // adds cart, no purchase
  { type: "loyal_shopper", weight: 10 }        // high convert rate
];

function choosePersona() {
  const total = PERSONAS.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (let p of PERSONAS) {
    if (r < p.weight) return p.type;
    r -= p.weight;
  }
}

// utils
const PAGES = [
  "Home","Electronics","Mobiles","Clothing","Laptops","Shoes",
  "Grocery","Toys","Books","Product Page","Checkout"
];
const DEVICES = ["Desktop", "Mobile", "Tablet"];
const COUNTRIES = ["USA", "India", "UK", "Germany"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ------------------------------------------------
// MAIN EVENT GENERATOR
// ------------------------------------------------

function generateSessionEvents(persona, sessionStart) {
  const events = [];

  // 1) session_start
  let currentTime = dayjs(sessionStart);
  events.push({
    eventType: "session_start",
    page: "Home",
    timestamp: currentTime.toDate(),
    durationSec: 0,
  });

  // Personas determine event flow
  const steps = [];

  if (persona === "browser") {
    steps.push("page_visit", "page_visit", "page_visit");
  }

  if (persona === "researcher") {
    steps.push("page_visit","search","search","page_visit");
  }

  if (persona === "impulse_buyer") {
    steps.push("page_visit","product_view","add_to_cart","purchase");
  }

  if (persona === "cart_abandoner") {
    steps.push("page_visit","product_view","add_to_cart");
  }

  if (persona === "loyal_shopper") {
    steps.push("page_visit","product_view","add_to_cart","purchase","page_visit","purchase");
  }

  for (let step of steps) {
    currentTime = currentTime.add(Math.floor(Math.random() * 10) + 1, "minute");

    events.push({
      eventType: step,
      page:
        step === "product_view"
          ? "Product Page"
          : step === "purchase"
          ? "Checkout"
          : random(PAGES),
      timestamp: currentTime.toDate(),
      durationSec: Math.floor(Math.random() * 120) + 10,
    });
  }

  return events;
}

// ------------------------------------------------
// SEEDER
// ------------------------------------------------

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const usersCol = db.collection("users");
  const sessionsCol = db.collection("sessions");
  const eventsCol = db.collection("events");

//   await usersCol.deleteMany({});
  await sessionsCol.deleteMany({});
  await eventsCol.deleteMany({});

  console.log("Seeding users…");

  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      device: random(DEVICES),
      country: random(COUNTRIES),
      createdAt: new Date(),
    });
  }

  const userInsert = await usersCol.insertMany(users);

  console.log("Users inserted:", userInsert.insertedCount);

  // Generate sessions and events
  let allEvents = [];
  let allSessions = [];

  console.log("Generating sessions + events…");

  for (let i = 0; i < NUM_SESSIONS; i++) {
    const userId = random(Object.values(userInsert.insertedIds));
    const persona = choosePersona();

    const sessionStart = dayjs().subtract(Math.random() * 60, "day");
    const sessionId = new ObjectId();

    const events = generateSessionEvents(persona, sessionStart);

    allSessions.push({
      _id: sessionId,
      userId,
      persona,
      sessionStart: events[0].timestamp,
      sessionEnd: events[events.length - 1].timestamp,
      eventCount: events.length,
    });

    // Attach session ID + user ID to each event
    events.forEach((ev) => {
      allEvents.push({
        ...ev,
        sessionId,
        userId,
      });
    });
  }

  console.log("Inserting sessions + events to MongoDB…");

  await sessionsCol.insertMany(allSessions);
  await eventsCol.insertMany(allEvents);

  console.log("SEED COMPLETE 🎉");
  client.close();
}

seed().catch(console.error);
