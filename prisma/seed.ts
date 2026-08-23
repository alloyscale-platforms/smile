import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORY_LABELS: Record<string, { en: string; vi: string }> = {
  translation: { en: "Translation", vi: "Dịch thuật" },
  "tech-setup": { en: "Tech setup", vi: "Cài đặt công nghệ" },
  transportation: { en: "Transportation", vi: "Đưa đón" },
  groceries: { en: "Groceries & errands", vi: "Mua đồ & việc vặt" },
  companionship: { en: "Companionship & check-ins", vi: "Thăm hỏi & trò chuyện" },
  paperwork: { en: "Paperwork & forms", vi: "Giấy tờ & biểu mẫu" },
  "medical-accompaniment": {
    en: "Medical appointment accompaniment",
    vi: "Đi cùng khám bệnh",
  },
  "home-help": { en: "Home help", vi: "Giúp việc nhà" },
  other: { en: "Something else", vi: "Việc khác" },
};

const isProduction = process.env.NODE_ENV === "production";

async function main() {
  for (const cat of DEFAULT_CATEGORIES) {
    const labels = CATEGORY_LABELS[cat.slug];
    await prisma.helpCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        labelEn: labels.en,
        labelVi: labels.vi,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@smile.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (isProduction && !adminPassword) {
    throw new Error(
      "Set SEED_ADMIN_PASSWORD (and optionally SEED_ADMIN_EMAIL) before seeding a production database.",
    );
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword ?? "smile-admin-123", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Smile Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      locale: "en",
    },
  });

  if (!isProduction) {
    const helperPasswordHash = await bcrypt.hash("smile-demo-123", 10);
    await prisma.user.upsert({
      where: { email: "helper@smile.local" },
      update: {},
      create: {
        name: "Demo Helper",
        email: "helper@smile.local",
        passwordHash: helperPasswordHash,
        role: "HELPER",
        status: "ACTIVE",
        locale: "en",
      },
    });

    const requesterPasswordHash = await bcrypt.hash("smile-demo-123", 10);
    await prisma.user.upsert({
      where: { email: "requester@smile.local" },
      update: {},
      create: {
        name: "Demo Requester",
        email: "requester@smile.local",
        passwordHash: requesterPasswordHash,
        role: "REQUESTER",
        status: "PENDING",
        locale: "vi",
      },
    });
  }

  await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      titleEn: "Neighbors helping neighbors",
      titleVi: "Hàng xóm giúp đỡ hàng xóm",
      bodyEn: "Smile connects older adults who need a hand with younger volunteers nearby.",
      bodyVi: "Smile kết nối các cô chú lớn tuổi cần giúp đỡ với các bạn trẻ tình nguyện gần đó.",
    },
  });

  console.log("Seed complete.");
  if (adminPassword) {
    console.log(`  Admin login: ${adminEmail} (password set via SEED_ADMIN_PASSWORD)`);
  } else {
    console.log(`  Admin login:     ${adminEmail} / smile-admin-123`);
    console.log("  Helper login:    helper@smile.local / smile-demo-123 (already ACTIVE)");
    console.log("  Requester login: requester@smile.local / smile-demo-123 (PENDING approval)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
