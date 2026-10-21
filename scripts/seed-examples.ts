import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { seedExamples } = await import("../lib/seed-examples");
  const { prisma } = await import("../lib/prisma");
  try {
    console.log("Examples initialized:", await seedExamples());
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
