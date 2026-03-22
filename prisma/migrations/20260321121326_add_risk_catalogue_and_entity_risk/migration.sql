-- CreateTable
CREATE TABLE `risk_catalogue_item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `risk_type` VARCHAR(191) NOT NULL,
    `risk_domain` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_catalogue_item_code_key`(`code`),
    INDEX `risk_catalogue_item_risk_type_idx`(`risk_type`),
    INDEX `risk_catalogue_item_risk_domain_idx`(`risk_domain`),
    INDEX `risk_catalogue_item_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entity_risk` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `catalogue_item_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `risk_type` VARCHAR(191) NOT NULL,
    `risk_domain` VARCHAR(191) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `entity_risk_entity_id_idx`(`entity_id`),
    INDEX `entity_risk_catalogue_item_id_idx`(`catalogue_item_id`),
    INDEX `entity_risk_is_primary_idx`(`is_primary`),
    UNIQUE INDEX `entity_risk_entity_id_catalogue_item_id_key`(`entity_id`, `catalogue_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entity_risk` ADD CONSTRAINT `entity_risk_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entity_risk` ADD CONSTRAINT `entity_risk_catalogue_item_id_fkey` FOREIGN KEY (`catalogue_item_id`) REFERENCES `risk_catalogue_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
