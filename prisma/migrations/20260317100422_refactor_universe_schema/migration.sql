/*
  Warnings:

  - You are about to drop the column `audit_sponsor` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `owner_unit_id` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `process_owner` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `risk_assessed_at` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `risk_assessed_by` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `risk_impact` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `risk_likelihood` on the `auditable_entity` table. All the data in the column will be lost.
  - You are about to drop the column `risk_rationale` on the `auditable_entity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `auditable_entity` DROP FOREIGN KEY `auditable_entity_owner_unit_id_fkey`;

-- DropIndex
DROP INDEX `auditable_entity_owner_unit_id_idx` ON `auditable_entity`;

-- AlterTable
ALTER TABLE `auditable_entity` DROP COLUMN `audit_sponsor`,
    DROP COLUMN `owner_unit_id`,
    DROP COLUMN `process_owner`,
    DROP COLUMN `risk_assessed_at`,
    DROP COLUMN `risk_assessed_by`,
    DROP COLUMN `risk_impact`,
    DROP COLUMN `risk_likelihood`,
    DROP COLUMN `risk_rationale`,
    ADD COLUMN `audit_sponsor_id` VARCHAR(191) NULL,
    ADD COLUMN `process_owner_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `auditable_entity_owner` (
    `entity_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_assessment` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `impact` INTEGER NOT NULL,
    `likelihood` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `rationale` TEXT NOT NULL,
    `assessed_by` VARCHAR(191) NOT NULL,
    `assessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `risk_assessment_entity_id_idx`(`entity_id`),
    INDEX `risk_assessment_assessed_at_idx`(`assessed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `auditable_entity_audit_sponsor_id_idx` ON `auditable_entity`(`audit_sponsor_id`);

-- CreateIndex
CREATE INDEX `auditable_entity_process_owner_id_idx` ON `auditable_entity`(`process_owner_id`);

-- AddForeignKey
ALTER TABLE `auditable_entity` ADD CONSTRAINT `auditable_entity_audit_sponsor_id_fkey` FOREIGN KEY (`audit_sponsor_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity` ADD CONSTRAINT `auditable_entity_process_owner_id_fkey` FOREIGN KEY (`process_owner_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_owner` ADD CONSTRAINT `auditable_entity_owner_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_owner` ADD CONSTRAINT `auditable_entity_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessment` ADD CONSTRAINT `risk_assessment_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
