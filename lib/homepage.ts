export const shopLinks = {
  cleanser: "https://e.tb.cn/h.iwNXkyWkxQtLY2P?tk=qXs75Oi1oRf",
  toner: "https://e.tb.cn/h.iwN2hEVsbfdh3Fr?tk=EfK35Oi2mS5",
  lotion: "https://e.tb.cn/h.iEGsdmjGjdtHwww?tk=Rd325Oi22O6",
};

export const placeholderImages = {
  cleanser:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=80",
  toner:
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=80",
  lotion:
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1400&q=80",
  routine:
    "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
  science:
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=80",
};

export const products = [
  {
    slug: "jie-mian-mu-si",
    name: "东面山洁面慕斯",
    shortName: "洁面慕斯",
    routineStep: "第一步 清洁",
    subtitle: "温和清洁，洗去油脂与疲惫感",
    summary: "为剃须后、出油多、通勤频繁的熟龄男性设计，帮助肌肤回到清爽但不紧绷的状态。",
    image: placeholderImages.cleanser,
    shopUrl: shopLinks.cleanser,
    benefits: ["温和净澈", "剃须后舒缓", "清爽不拔干"],
    scenes: ["晨间洗漱", "运动后清洁", "商务差旅"],
  },
  {
    slug: "jing-hua-shui",
    name: "东面山精华水",
    shortName: "精华水",
    routineStep: "第二步 补水",
    subtitle: "补水修护，打开后续吸收通道",
    summary: "用于洁面后第一时间补充水分，帮助改善粗糙、暗沉、干纹初现等熟龄肌常见问题。",
    image: placeholderImages.toner,
    shopUrl: shopLinks.toner,
    benefits: ["水油平衡", "细致肤感", "提升通透感"],
    scenes: ["剃须后护理", "空调房办公", "熬夜后急救"],
  },
  {
    slug: "jing-hua-ru",
    name: "东面山精华乳",
    shortName: "精华乳",
    routineStep: "第三步 修护",
    subtitle: "紧致锁水，守住成熟男性的体面状态",
    summary: "承接补水步骤，提供更持久的滋润与屏障支持，适合关注轮廓、细纹和干燥问题的人群。",
    image: placeholderImages.lotion,
    shopUrl: shopLinks.lotion,
    benefits: ["紧致抗老", "强韧屏障", "长效锁水"],
    scenes: ["夜间修护", "干燥季节", "高压工作期"],
  },
];

export const navItems = [
  {
    label: "产品一览",
    href: "/chanpin",
    children: products.map((product) => ({
      label: product.shortName,
      href: `/chanpin/${product.slug}`,
    })),
  },
  {
    label: "教育",
    href: "/hufuzhishi",
    children: [
      { label: "其他", href: "/other" },
      { label: "人群认知", href: "/audience-awareness" },
      { label: "使用指南", href: "/usage-guide" },
      { label: "产品说明", href: "/product-description" },
      { label: "关系送礼", href: "/relationship-gifting" },
      { label: "选购指南", href: "/selection-guide" },
      { label: "问题解决", href: "/problem-solving" },
      { label: "护肤科普", href: "/skincare-science" },
      { label: "品牌介绍", href: "/brand-introduction" },
    ],
  },
  {
    label: "关于东面山",
    href: "/guanyudongmianshan",
    children: [
      { label: "品牌故事", href: "/guanyudongmianshan#story" },
      { label: "研发理念", href: "/guanyudongmianshan#research" },
    ],
  },
  {
    label: "肌肤测试",
    href: "/jifuceping",
  },
];

export const topLinks = [
  { label: "联系我们", href: "/lianxiwomen" },
  { label: "常见问题解答", href: "/changjianwenti" },
  { label: "搜索", href: "/sousuo" },
];

export const scienceArticles = [
  {
    title: "熟龄男士为什么要先稳定屏障",
    summary: "从清洁、剃须、环境刺激三个角度，解释屏障状态对后续功效护肤的影响。",
    href: "/skincare-science/mature-skin-barrier-guide",
  },
  {
    title: "玻色因、胶原与肽类成分如何协同",
    summary: "用通俗语言拆解紧致、充盈、修护背后的配方逻辑。",
    href: "/skincare-science",
  },
  {
    title: "三步护肤如何适配晨间与夜间",
    summary: "给繁忙男性一套低负担、可长期执行的护肤节奏。",
    href: "/usage-guide/morning-evening-routine-tutorial",
  },
];

export const testimonials = [
  {
    name: "42岁 企业管理者",
    quote: "以前护肤步骤太多坚持不下来，三步流程更适合我的工作节奏，洗完脸后的紧绷感少了。",
  },
  {
    name: "38岁 户外运动爱好者",
    quote: "运动后和剃须后都更愿意做基础护理，产品肤感清爽，不会影响后续出门。",
  },
  {
    name: "45岁 内容创作者",
    quote: "拍摄前状态更稳定，脸部看起来没那么疲惫，品牌调性也符合成熟男性审美。",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}
