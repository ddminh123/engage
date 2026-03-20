-- CreateTable
CREATE TABLE `audit_plan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `period_type` VARCHAR(191) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `created_by` VARCHAR(191) NULL,
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `audit_plan_status_idx`(`status`),
    INDEX `audit_plan_period_type_idx`(`period_type`),
    INDEX `audit_plan_period_start_idx`(`period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planned_audit` (
    `id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `objective` TEXT NULL,
    `scheduled_start` DATE NOT NULL,
    `scheduled_end` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `priority` VARCHAR(191) NULL,
    `estimated_days` INTEGER NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `planned_audit_plan_id_idx`(`plan_id`),
    INDEX `planned_audit_entity_id_idx`(`entity_id`),
    INDEX `planned_audit_status_idx`(`status`),
    UNIQUE INDEX `planned_audit_plan_id_entity_id_key`(`plan_id`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `planned_audit` ADD CONSTRAINT `planned_audit_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `audit_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit` ADD CONSTRAINT `planned_audit_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
