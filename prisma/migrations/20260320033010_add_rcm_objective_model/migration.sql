/*
  Warnings:

  - You are about to drop the column `audit_objective_id` on the `engagement_risk` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `engagement_risk` DROP FOREIGN KEY `engagement_risk_audit_objective_id_fkey`;

-- DropIndex
DROP INDEX `engagement_risk_audit_objective_id_idx` ON `engagement_risk`;

-- AlterTable
ALTER TABLE `engagement_risk` DROP COLUMN `audit_objective_id`,
    ADD COLUMN `rcm_objective_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `engagement_rcm_objective` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `audit_objective_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_rcm_objective_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_rcm_objective_audit_objective_id_idx`(`audit_objective_id`),
    INDEX `engagement_rcm_objective_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `engagement_risk_rcm_objective_id_idx` ON `engagement_risk`(`rcm_objective_id`);

-- AddForeignKey
ALTER TABLE `engagement_rcm_objective` ADD CONSTRAINT `engagement_rcm_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_rcm_objective` ADD CONSTRAINT `engagement_rcm_objective_audit_objective_id_fkey` FOREIGN KEY (`audit_objective_id`) REFERENCES `audit_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_rcm_objective_id_fkey` FOREIGN KEY (`rcm_objective_id`) REFERENCES `engagement_rcm_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
