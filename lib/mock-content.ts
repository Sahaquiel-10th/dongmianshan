import type { Article, ArticleStatus } from "@prisma/client";
import type { ArticleCategorySlug } from "./categories";

const now = new Date("2026-04-29T10:00:00.000Z");

function createMockArticle(input: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: ArticleCategorySlug;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
}): Article {
  return {
    id: input.id,
    code: input.id.replace(/^mock-/, "").toUpperCase(),
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    content: input.content,
    coverImage: null,
    category: input.category,
    tags: input.tags ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    relatedArticleIds: [],
    status: "published" as ArticleStatus,
    author: "东面山内容编辑部",
    publishedAt: now,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export const MOCK_PUBLISHED_ARTICLES: Article[] = [
  createMockArticle({
    id: "mock-science-1",
    title: "熟龄男士护肤为什么要先看屏障状态",
    slug: "mature-skin-barrier-guide",
    summary: "从屏障、清洁、保湿三个角度，理解熟龄男士护肤的核心起点。",
    category: "skincare-science",
    tags: "屏障修护,熟龄护肤,男士科普",
    seoTitle: "熟龄男士护肤为什么先看屏障状态",
    seoDescription: "东面山科普内容：熟龄男士护肤为什么要优先评估皮肤屏障状态。",
    content: `# 熟龄男士护肤为什么要先看屏障状态

很多熟龄男士不是“没有在护肤”，而是**护肤顺序错了**。

## 先判断是否是屏障问题

- 洗完脸很快发紧
- 剃须后容易刺痛
- 天气一变就泛红

如果这些情况长期存在，优先要做的是**减轻刺激、稳定屏障**，而不是一开始就叠加强功效产品。

## 一个更稳妥的三步思路

1. 温和清洁
2. 及时补水
3. 持续锁水和修护

> 先把皮肤状态稳住，再谈提亮、淡纹、紧致，效率会更高。
`,
  }),
  createMockArticle({
    id: "mock-review-1",
    title: "三步护肤方案是否适合工作繁忙的熟龄男性",
    slug: "three-step-routine-review",
    summary: "从执行成本、肤感和稳定性角度，评估精简护肤方案是否足够实用。",
    category: "product-description",
    tags: "产品评测,三步护肤,效率护肤",
    content: `# 三步护肤方案是否适合工作繁忙的熟龄男性

对于节奏快的用户，复杂流程通常坚持不下来。

## 为什么三步方案更容易长期执行

- 上手门槛低
- 早晚流程一致
- 更容易观察皮肤变化

## 评测结论

如果你的目标是**稳定、长期、低负担**，三步方案通常比堆很多单品更合适。`,
  }),
  createMockArticle({
    id: "mock-tutorial-1",
    title: "早晚护肤步骤怎么排才不浪费",
    slug: "morning-evening-routine-tutorial",
    summary: "给首次建立护肤习惯的熟龄男士一份可执行的早晚顺序参考。",
    category: "usage-guide",
    tags: "护肤教程,使用顺序,新手指南",
    content: `# 早晚护肤步骤怎么排才不浪费

## 早上

1. 洁面
2. 精华水
3. 精华乳

## 晚上

1. 洁面
2. 精华水
3. 精华乳

核心不是步骤多，而是**稳定持续**。`,
  }),
  createMockArticle({
    id: "mock-faq-1",
    title: "FAQ：男士护肤一定要分早晚两套吗",
    slug: "faq-do-men-need-separate-routines",
    summary: "回答熟龄男士护肤里最常见的流程问题，降低上手门槛。",
    category: "problem-solving",
    tags: "FAQ,护肤流程,男士护理",
    content: `# FAQ：男士护肤一定要分早晚两套吗

不一定。

如果你是刚开始建立习惯，先用一套**简单、可坚持**的流程更重要。

只有在夜间修护需求明显增加时，再考虑做针对性区分。`,
  }),
  createMockArticle({
    id: "mock-case-1",
    title: "案例：从剃须后泛红到状态稳定的 4 周调整",
    slug: "case-shaving-redness-recovery",
    summary: "一个简化的内容示例，展示案例型文章在前台的呈现方式。",
    category: "other",
    tags: "案例,剃须敏感,修护记录",
    content: `# 案例：从剃须后泛红到状态稳定的 4 周调整

## 初始问题

- 剃须后明显泛红
- 两颊紧绷
- 偶发起皮

## 调整重点

1. 减少刺激型清洁
2. 强化补水
3. 固定修护节奏

四周后，皮肤状态通常会比“今天用这个、明天换那个”的方式更稳定。`,
  }),
];
