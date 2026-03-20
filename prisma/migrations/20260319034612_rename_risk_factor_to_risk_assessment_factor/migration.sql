/*
  Warnings:

  - You are about to drop the `risk_factor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `risk_factor`;

-- CreateTable
CREATE TABLE `risk_assessment_factor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `relates_to` VARCHAR(191) NOT NULL DEFAULT 'impact',
    `is_positive` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_assessment_factor_code_key`(`code`),
    INDEX `risk_assessment_factor_is_active_idx`(`is_active`),
    INDEX `risk_assessment_factor_relates_to_idx`(`relates_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
