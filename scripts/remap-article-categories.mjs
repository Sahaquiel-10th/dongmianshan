import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_MAP = new Map([
  ["brand", "brand-introduction"],
  ["science", "skincare-science"],
  ["review", "product-description"],
  ["tutorial", "usage-guide"],
  ["faq", "problem-solving"],
  ["case-study", "other"],
]);

const VALID_CATEGORIES = new Set([
  "other",
  "audience-awareness",
  "usage-guide",
  "product-description",
  "relationship-gifting",
  "selection-guide",
  "problem-solving",
  "skincare-science",
  "brand-introduction",
]);

async function main() {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      category: true,
    },
  });

  const summary = {
    unchanged: 0,
    remapped: 0,
    movedToOther: 0,
  };

  for (const article of articles) {
    if (VALID_CATEGORIES.has(article.category)) {
      summary.unchanged += 1;
      continue;
    }

    const nextCategory = CATEGORY_MAP.get(article.category) ?? "other";

    await prisma.article.update({
      where: {
        id: article.id,
      },
      data: {
        category: nextCategory,
      },
    });

    if (CATEGORY_MAP.has(article.category)) {
      summary.remapped += 1;
      console.log(`${article.category} -> ${nextCategory}: ${article.title}`);
    } else {
      summary.movedToOther += 1;
      console.log(`${article.category} -> other: ${article.title}`);
    }
  }

  console.log("Article category remap complete:", summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
