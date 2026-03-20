/*
  Warnings:

  - You are about to drop the column `control_description` on the `engagement_risk` table. All the data in the column will be lost.
  - You are about to drop the column `control_effectiveness` on the `engagement_risk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `engagement_risk` DROP COLUMN `control_description`,
    DROP COLUMN `control_effectiveness`;

-- CreateTable
CREATE TABLE `engagement_control` (
    `id` VARCHAR(191) NOT NULL,
    `risk_id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `effectiveness` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_control_risk_id_idx`(`risk_id`),
    INDEX `engagement_control_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `engagement_control` ADD CONSTRAINT `engagement_control_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `engagement_risk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
