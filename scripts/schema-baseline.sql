-- CreateTable
CREATE TABLE `Article` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(40) NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImage` VARCHAR(2048) NULL,
    `category` VARCHAR(80) NOT NULL,
    `tags` TEXT NULL,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` TEXT NULL,
    `relatedArticleIds` JSON NULL,
    `relatedProductSlugs` JSON NULL,
    `isExample` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `author` VARCHAR(100) NULL,
    `publishedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Article_code_key`(`code`),
    UNIQUE INDEX `Article_slug_key`(`slug`),
    INDEX `Article_category_idx`(`category`),
    INDEX `Article_code_idx`(`code`),
    INDEX `Article_status_idx`(`status`),
    INDEX `Article_deletedAt_idx`(`deletedAt`),
    INDEX `Article_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `subtitle` VARCHAR(200) NULL,
    `summary` TEXT NULL,
    `routineStep` VARCHAR(80) NULL,
    `coverImage` VARCHAR(2048) NULL,
    `shopUrl` VARCHAR(2048) NULL,
    `benefits` JSON NULL,
    `scenes` JSON NULL,
    `usage` TEXT NULL,
    `features` TEXT NULL,
    `ingredients` TEXT NULL,
    `relatedArticleIds` JSON NULL,
    `isExample` BOOLEAN NOT NULL DEFAULT false,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` TEXT NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_status_idx`(`status`),
    INDEX `Product_sortOrder_idx`(`sortOrder`),
    INDEX `Product_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSection` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(80) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `eyebrow` VARCHAR(120) NULL,
    `subtitle` TEXT NULL,
    `body` TEXT NULL,
    `mediaUrl` VARCHAR(2048) NULL,
    `ctaLabel` VARCHAR(80) NULL,
    `ctaUrl` VARCHAR(2048) NULL,
    `tags` JSON NULL,
    `items` JSON NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SiteSection_key_key`(`key`),
    INDEX `SiteSection_status_idx`(`status`),
    INDEX `SiteSection_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `name` VARCHAR(60) NOT NULL,
    `content` LONGBLOB NOT NULL,
    `mimeType` VARCHAR(50) NOT NULL DEFAULT 'image/webp',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
