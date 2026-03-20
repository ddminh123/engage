-- CreateTable
CREATE TABLE `engagement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `planned_audit_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'planning',
    `objective` TEXT NULL,
    `scope` TEXT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `estimated_days` INTEGER NULL,
    `priority` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `engagement_planned_audit_id_key`(`planned_audit_id`),
    INDEX `engagement_status_idx`(`status`),
    INDEX `engagement_entity_id_idx`(`entity_id`),
    INDEX `engagement_planned_audit_id_idx`(`planned_audit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_section` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `review_notes` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_section_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_section_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_objective` (
    `id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `review_notes` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_objective_section_id_idx`(`section_id`),
    INDEX `engagement_objective_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_procedure` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NULL,
    `objective_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `procedure_type` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `observations` TEXT NULL,
    `conclusion` TEXT NULL,
    `sample_size` INTEGER NULL,
    `exceptions` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `priority` VARCHAR(191) NULL,
    `review_notes` TEXT NULL,
    `performed_by` VARCHAR(191) NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `performed_at` DATETIME(3) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_procedure_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_procedure_section_id_idx`(`section_id`),
    INDEX `engagement_procedure_objective_id_idx`(`objective_id`),
    INDEX `engagement_procedure_sort_order_idx`(`sort_order`),
    INDEX `engagement_procedure_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draft_finding` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `risk_rating` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `recommendation` TEXT NULL,
    `management_response` TEXT NULL,
    `root_cause` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `draft_finding_engagement_id_idx`(`engagement_id`),
    INDEX `draft_finding_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draft_finding_procedure` (
    `finding_id` VARCHAR(191) NOT NULL,
    `procedure_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`finding_id`, `procedure_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `engagement` ADD CONSTRAINT `engagement_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement` ADD CONSTRAINT `engagement_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_section` ADD CONSTRAINT `engagement_section_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `engagement_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `engagement_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_objective_id_fkey` FOREIGN KEY (`objective_id`) REFERENCES `engagement_objective`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding` ADD CONSTRAINT `draft_finding_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_procedure` ADD CONSTRAINT `draft_finding_procedure_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_procedure` ADD CONSTRAINT `draft_finding_procedure_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
