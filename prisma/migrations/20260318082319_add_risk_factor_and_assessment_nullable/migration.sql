-- AlterTable
ALTER TABLE `risk_assessment` MODIFY `inherent_impact` INTEGER NULL,
    MODIFY `inherent_likelihood` INTEGER NULL,
    MODIFY `inherent_score` INTEGER NULL;

-- CreateTable
CREATE TABLE `risk_factor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_factor_code_key`(`code`),
    INDEX `risk_factor_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
