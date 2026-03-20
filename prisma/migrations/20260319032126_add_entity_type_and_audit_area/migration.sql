/*
  Warnings:

  - You are about to drop the column `area` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `entity_type` on the `auditable_entity` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `auditable_entity_area_idx` ON `auditable_entity`;

-- DropIndex
DROP INDEX `auditable_entity_entity_type_idx` ON `auditable_entity`;

-- AlterTable
ALTER TABLE `auditable_entity` DROP COLUMN `area`,
    DROP COLUMN `entity_type`,
    ADD COLUMN `entity_type_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `entity_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entity_type_code_key`(`code`),
    INDEX `entity_type_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_area` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `audit_area_code_key`(`code`),
    INDEX `audit_area_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_area` (
    `entity_id` VARCHAR(191) NOT NULL,
    `area_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `auditable_entity_entity_type_id_idx` ON `auditable_entity`(`entity_type_id`);

-- AddForeignKey
ALTER TABLE `auditable_entity` ADD CONSTRAINT `auditable_entity_entity_type_id_fkey` FOREIGN KEY (`entity_type_id`) REFERENCES `entity_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_area` ADD CONSTRAINT `auditable_entity_area_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_area` ADD CONSTRAINT `auditable_entity_area_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `audit_area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
