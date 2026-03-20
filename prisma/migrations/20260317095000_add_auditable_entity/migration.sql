-- CreateTable
CREATE TABLE `auditable_entity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `owner_unit_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `audit_cycle` VARCHAR(191) NULL,
    `risk_impact` INTEGER NULL,
    `risk_likelihood` INTEGER NULL,
    `risk_score` INTEGER NULL,
    `risk_level` VARCHAR(191) NULL,
    `risk_rationale` TEXT NULL,
    `risk_assessed_at` DATETIME(3) NULL,
    `risk_assessed_by` VARCHAR(191) NULL,
    `audit_sponsor` VARCHAR(191) NULL,
    `process_owner` VARCHAR(191) NULL,
    `last_audited_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `auditable_entity_code_key`(`code`),
    INDEX `auditable_entity_entity_type_idx`(`entity_type`),
    INDEX `auditable_entity_area_idx`(`area`),
    INDEX `auditable_entity_owner_unit_id_idx`(`owner_unit_id`),
    INDEX `auditable_entity_status_idx`(`status`),
    INDEX `auditable_entity_risk_level_idx`(`risk_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_participant` (
    `entity_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auditable_entity` ADD CONSTRAINT `auditable_entity_owner_unit_id_fkey` FOREIGN KEY (`owner_unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_participant` ADD CONSTRAINT `auditable_entity_participant_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_participant` ADD CONSTRAINT `auditable_entity_participant_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
