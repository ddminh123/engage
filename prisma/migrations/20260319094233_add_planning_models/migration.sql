-- AlterTable
ALTER TABLE `engagement` ADD COLUMN `understanding` TEXT NULL;

-- CreateTable
CREATE TABLE `audit_objective` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `audit_objective_engagement_id_idx`(`engagement_id`),
    INDEX `audit_objective_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_risk` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `audit_objective_id` VARCHAR(191) NULL,
    `risk_description` TEXT NOT NULL,
    `control_description` TEXT NULL,
    `control_effectiveness` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_risk_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_risk_audit_objective_id_idx`(`audit_objective_id`),
    INDEX `engagement_risk_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_objective` ADD CONSTRAINT `audit_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_audit_objective_id_fkey` FOREIGN KEY (`audit_objective_id`) REFERENCES `audit_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
