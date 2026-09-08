import { PrismaClient, RideStyle, RiderLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scryptSync, randomBytes } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

// Bengaluru city center — riders are scattered within ~40km of here.
const CENTER = { lat: 12.9716, lng: 77.5946 };

function jitterKm(km: number) {
  return (Math.random() - 0.5) * 2 * km;
}

function offsetPoint(center: { lat: number; lng: number }, km: number) {
  return {
    lat: center.lat + jitterKm(km) / 110.574,
    lng: center.lng + jitterKm(km) / (111.32 * Math.cos((center.lat * Math.PI) / 180)),
  };
}

const BIKES = [
  { brand: "Royal Enfield", model: "Himalayan", cc: 411 },
  { brand: "Royal Enfield", model: "Classic 350", cc: 349 },
  { brand: "KTM", model: "Duke 390", cc: 373 },
  { brand: "KTM", model: "Adventure 390", cc: 373 },
  { brand: "Bajaj", model: "Dominar 400", cc: 373 },
  { brand: "TVS", model: "Apache RR 310", cc: 312 },
  { brand: "Yamaha", model: "MT-15", cc: 155 },
  { brand: "Honda", model: "CB350RS", cc: 348 },
  { brand: "Triumph", model: "Speed 400", cc: 398 },
  { brand: "Kawasaki", model: "Versys 650", cc: 649 },
  { brand: "Harley-Davidson", model: "X440", cc: 440 },
  { brand: "Suzuki", model: "V-Strom SX", cc: 250 },
];

const STYLES = Object.values(RideStyle);
const LEVELS = Object.values(RiderLevel);

const FIRST_NAMES = [
  "Arjun", "Vikram", "Rahul", "Kabir", "Aditya", "Rohan", "Karthik", "Nikhil",
  "Sanjay", "Varun", "Aisha", "Meera", "Priya", "Divya", "Neha", "Ananya",
];
const LAST_NAMES = [
  "Rao", "Nair", "Menon", "Iyer", "Reddy", "Gowda", "Shetty", "Kapoor",
  "Malhotra", "Kumar", "Singh", "Pillai",
];

async function main() {
  console.log("Seeding demo riders...");

  const riderIds: string[] = [];

  for (let i = 0; i < 16; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const username = `${first.toLowerCase()}${i}`;
    const point = offsetPoint(CENTER, 35);
    const bike = BIKES[i % BIKES.length];
    const minutesAgo = [1, 3, 20, 60, 60 * 6, 60 * 24 * 3][i % 6];

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@rydo.dev`,
        passwordHash: hashPassword("password123"),
        isVerified: true,
        lastSeenAt: new Date(Date.now() - minutesAgo * 60_000),
        riderProfile: {
          create: {
            fullName: `${first} ${last}`,
            city: "Bengaluru",
            state: "Karnataka",
            country: "India",
            latitude: point.lat,
            longitude: point.lng,
            ridingStyle: STYLES[i % STYLES.length],
            level: LEVELS[i % LEVELS.length],
            preferredRadiusKm: 25 + (i % 4) * 10,
            yearsRiding: 1 + (i % 10),
            totalRides: i * 3,
            totalDistanceKm: i * 120,
            profileCompleted: true,
          },
        },
        bikes: {
          create: {
            brand: bike.brand,
            model: bike.model,
            engineCc: bike.cc,
            isPrimary: true,
          },
        },
      },
      select: { id: true },
    });

    riderIds.push(user.id);
  }

  console.log(`Seeded ${riderIds.length} riders.`);

  const rideDefs = [
    {
      title: "Sunday Nandi Hills Breakfast Run",
      style: RideStyle.BREAKFAST,
      status: "PUBLISHED" as const,
      startName: "Hebbal Flyover",
      destName: "Nandi Hills",
      daysFromNow: 3,
    },
    {
      title: "Midnight City Cruise",
      style: RideStyle.NIGHT,
      status: "PUBLISHED" as const,
      startName: "Indiranagar 100ft Road",
      destName: "Nice Road Toll",
      daysFromNow: 5,
    },
    {
      title: "Coorg Weekend Getaway",
      style: RideStyle.WEEKEND,
      status: "PUBLISHED" as const,
      startName: "Electronic City",
      destName: "Madikeri, Coorg",
      daysFromNow: 10,
    },
    {
      title: "Live Now: Airport Highway Blast",
      style: RideStyle.HIGHWAY,
      status: "ONGOING" as const,
      startName: "Hebbal",
      destName: "Kempegowda International Airport",
      daysFromNow: 0,
    },
    {
      title: "Charity Ride for Riders' Relief Fund",
      style: RideStyle.CHARITY,
      status: "PUBLISHED" as const,
      startName: "Cubbon Park Gate",
      destName: "Ramanagara",
      daysFromNow: 14,
    },
  ];

  for (let i = 0; i < rideDefs.length; i++) {
    const def = rideDefs[i];
    const hostId = riderIds[i];
    const start = offsetPoint(CENTER, 8);
    const dest = offsetPoint(CENTER, 35);
    const rideDate = new Date(Date.now() + def.daysFromNow * 86_400_000);
    const meetupTime = new Date(rideDate);
    meetupTime.setHours(7, 30, 0, 0);

    const slug = def.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const existing = await prisma.ride.findUnique({ where: { slug }, select: { id: true } });
    if (existing) continue;

    const ride = await prisma.ride.create({
      data: {
        hostId,
        title: def.title,
        slug,
        description: `A ${def.style.toLowerCase()} ride from ${def.startName} to ${def.destName}.`,
        startLocationName: def.startName,
        startLatitude: start.lat,
        startLongitude: start.lng,
        destinationName: def.destName,
        destinationLatitude: dest.lat,
        destinationLongitude: dest.lng,
        rideDate,
        meetupTime,
        style: def.style,
        status: def.status,
        maxRiders: 12,
        minRiders: 2,
        members: {
          create: { userId: hostId, status: "JOINED", roleLabel: "captain", approvedAt: new Date() },
        },
        group: {
          create: {
            name: def.title,
            status: def.status === "ONGOING" ? "ACTIVE" : "PLANNED",
            activeFrom: def.status === "ONGOING" ? new Date(Date.now() - 6 * 60_000) : null,
            members: { create: { userId: hostId, isAdmin: true } },
          },
        },
      },
      select: { id: true, group: { select: { id: true } } },
    });

    // Add 2-4 more members to each ride, mixing JOINED and REQUESTED.
    const otherRiders = riderIds.filter((id) => id !== hostId).slice(i * 2, i * 2 + 4);
    for (let j = 0; j < otherRiders.length; j++) {
      const memberStatus = j === otherRiders.length - 1 ? "REQUESTED" : "JOINED";
      await prisma.rideMember.create({
        data: {
          rideId: ride.id,
          userId: otherRiders[j],
          status: memberStatus,
          approvedAt: memberStatus === "JOINED" ? new Date() : null,
        },
      });
      if (memberStatus === "JOINED" && ride.group) {
        await prisma.groupMember.create({
          data: { groupId: ride.group.id, userId: otherRiders[j] },
        });
      }
    }
  }

  console.log(`Seeded ${rideDefs.length} rides.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
