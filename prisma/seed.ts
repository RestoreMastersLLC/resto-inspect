import { PrismaClient, UserRole } from "./generated";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log("🧹 Clearing existing data...");
  await prisma.offlineQueue.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.mediaTag.deleteMany();
  await prisma.inspectionTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.mapPinMedia.deleteMany();
  await prisma.mapPin.deleteMany();
  await prisma.ownerInfo.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");

  const adminPassword = await hash("password123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@restoinspect.com",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const inspectorPassword = await hash("password123", 10);
  const inspector = await prisma.user.create({
    data: {
      email: "inspector@restoinspect.com",
      passwordHash: inspectorPassword,
      firstName: "Inspector",
      lastName: "User",
      name: "Inspector User",
      role: UserRole.INSPECTOR,
      isActive: true,
    },
  });

  const viewerPassword = await hash("password123", 10);
  const viewer = await prisma.user.create({
    data: {
      email: "viewer@restoinspect.com",
      passwordHash: viewerPassword,
      firstName: "Viewer",
      lastName: "User",
      name: "Viewer User",
      role: UserRole.VIEWER,
      isActive: true,
    },
  });

  console.log(`✅ Created ${admin.email}, ${inspector.email}, ${viewer.email}`);

  // Create tags
  console.log("🏷️ Creating tags...");
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "water-damage" } }),
    prisma.tag.create({ data: { name: "fire-damage" } }),
    prisma.tag.create({ data: { name: "structural" } }),
    prisma.tag.create({ data: { name: "electrical" } }),
    prisma.tag.create({ data: { name: "plumbing" } }),
    prisma.tag.create({ data: { name: "mold" } }),
    prisma.tag.create({ data: { name: "roof" } }),
    prisma.tag.create({ data: { name: "foundation" } }),
    prisma.tag.create({ data: { name: "hvac" } }),
    prisma.tag.create({ data: { name: "exterior" } }),
  ]);
  console.log(`✅ Created ${tags.length} tags`);

  // Create sample inspections
  console.log("🏠 Creating sample inspections...");

  const inspection1 = await prisma.inspection.create({
    data: {
      userId: inspector.id,
      status: "COMPLETED",
      notes: "Significant water damage found in basement. Mold remediation required.",
      isUrgent: true,
      street: "123 Main Street",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      country: "USA",
      addressFormatted: "123 Main Street, Houston, TX 77001",
      latitude: 29.7604,
      longitude: -95.3698,
      currentStep: 3,
      totalSteps: 3,
      completedSteps: ["address", "media", "submit"],
      completedAt: new Date(),
      submittedAt: new Date(),
      tags: {
        create: [
          { tag: { connect: { id: tags[0].id } } }, // water-damage
          { tag: { connect: { id: tags[5].id } } }, // mold
        ],
      },
    },
  });

  const inspection2 = await prisma.inspection.create({
    data: {
      userId: inspector.id,
      status: "IN_PROGRESS",
      notes: "Roof inspection in progress. Some shingles missing.",
      isUrgent: false,
      street: "456 Oak Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
      addressFormatted: "456 Oak Avenue, Austin, TX 78701",
      latitude: 30.2672,
      longitude: -97.7431,
      currentStep: 2,
      totalSteps: 3,
      completedSteps: ["address", "media"],
      tags: {
        create: [
          { tag: { connect: { id: tags[6].id } } }, // roof
        ],
      },
    },
  });

  const inspection3 = await prisma.inspection.create({
    data: {
      userId: inspector.id,
      status: "DRAFT",
      notes: "",
      isUrgent: false,
      street: "789 Elm Street",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      country: "USA",
      addressFormatted: "789 Elm Street, Dallas, TX 75201",
      latitude: 32.7767,
      longitude: -96.797,
      currentStep: 1,
      totalSteps: 3,
      completedSteps: ["address"],
    },
  });

  console.log(`✅ Created ${[inspection1, inspection2, inspection3].length} inspections`);

  // Create sample media items for completed inspection
  console.log("📸 Creating sample media items...");

  const mediaItem1 = await prisma.mediaItem.create({
    data: {
      inspectionId: inspection1.id,
      type: "PHOTO",
      url: "https://example.com/photos/water-damage-1.jpg",
      thumbnailUrl: "https://example.com/photos/water-damage-1-thumb.jpg",
      filename: "water-damage-1.jpg",
      fileSize: 2048000, // 2MB
      uploadStatus: "COMPLETED",
      quality: "HIGH",
      latitude: 29.7604,
      longitude: -95.3698,
      tags: {
        create: [
          { tag: { connect: { id: tags[0].id } } }, // water-damage
        ],
      },
    },
  });

  const mediaItem2 = await prisma.mediaItem.create({
    data: {
      inspectionId: inspection1.id,
      type: "PHOTO",
      url: "https://example.com/photos/mold-growth-1.jpg",
      thumbnailUrl: "https://example.com/photos/mold-growth-1-thumb.jpg",
      filename: "mold-growth-1.jpg",
      fileSize: 1536000, // 1.5MB
      uploadStatus: "COMPLETED",
      quality: "HIGH",
      latitude: 29.7604,
      longitude: -95.3698,
      tags: {
        create: [
          { tag: { connect: { id: tags[5].id } } }, // mold
        ],
      },
    },
  });

  // Create owner info for media
  await prisma.ownerInfo.create({
    data: {
      mediaItemId: mediaItem1.id,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      role: "Property Owner",
    },
  });

  console.log(`✅ Created ${[mediaItem1, mediaItem2].length} media items`);

  // Create map pins
  console.log("📍 Creating map pins...");

  await prisma.mapPin.create({
    data: {
      inspectionId: inspection1.id,
      description: "Water damage location - basement entry",
      latitude: 29.7604,
      longitude: -95.3698,
      isUrgent: true,
      media: {
        create: [{ mediaItem: { connect: { id: mediaItem1.id } } }],
      },
    },
  });

  console.log(`✅ Created map pin`);

  // Create app settings
  console.log("⚙️ Creating app settings...");

  await prisma.appSetting.create({
    data: {
      key: "app.version",
      value: '"1.0.0"',
      description: "Current application version",
    },
  });

  await prisma.appSetting.create({
    data: {
      key: "photo.maxSize",
      value: "52428800", // 50MB in bytes
      description: "Maximum photo file size in bytes",
    },
  });

  await prisma.appSetting.create({
    data: {
      key: "photo.quality",
      value: '"HIGH"',
      description: "Default photo quality setting",
    },
  });

  console.log(`✅ Created app settings`);

  // Create sample notifications
  console.log("🔔 Creating sample notifications...");

  await prisma.notification.create({
    data: {
      title: "Welcome to RestoInspect!",
      message: "Your account has been created successfully. Start your first inspection today.",
      type: "INFO",
      userId: inspector.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Urgent Inspection Required",
      message: "Water damage inspection at 123 Main Street requires immediate attention.",
      type: "WARNING",
      userId: admin.id,
      actionUrl: `/inspection/${inspection1.id}`,
    },
  });

  console.log(`✅ Created sample notifications`);

  // Create audit log entries
  console.log("📝 Creating audit log entries...");

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "login",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: { success: true },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: inspector.id,
      action: "create_inspection",
      ipAddress: "192.168.1.2",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      metadata: { inspectionId: inspection1.id },
    },
  });

  console.log(`✅ Created audit log entries`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`- Users: 3 (admin, inspector, viewer)`);
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Inspections: 3 (1 completed, 1 in-progress, 1 draft)`);
  console.log(`- Media Items: 2`);
  console.log(`- Map Pins: 1`);
  console.log(`- Notifications: 2`);
  console.log(`- App Settings: 3`);
  console.log(`- Audit Logs: 2`);
  console.log("\n🔑 Test credentials:");
  console.log("- admin@restoinspect.com / password123");
  console.log("- inspector@restoinspect.com / password123");
  console.log("- viewer@restoinspect.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
