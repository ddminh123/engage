-- DropIndex
DROP INDEX `approval_workflow_entity_type_idx` ON `approval_workflow`;

-- AlterTable
ALTER TABLE `approval_workflow` MODIFY `entity_type` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `engagement` ADD COLUMN `wp_approval_status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    ADD COLUMN `wp_approved_at` DATETIME(3) NULL,
    ADD COLUMN `wp_approved_by` VARCHAR(191) NULL,
    ADD COLUMN `wp_approved_version` INTEGER NULL;

-- AlterTable
ALTER TABLE `engagement_objective` ADD COLUMN `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    ADD COLUMN `planning_ref_id` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'planned';

-- AlterTable
ALTER TABLE `engagement_procedure` ADD COLUMN `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    ADD COLUMN `planning_ref_id` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'planned';

-- AlterTable
ALTER TABLE `engagement_section` ADD COLUMN `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    ADD COLUMN `planning_ref_id` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'planned';

-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'auditor';

-- CreateTable
CREATE TABLE `planning_step_config` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `step_type` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `planning_step_config_key_key`(`key`),
    INDEX `planning_step_config_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planning_workpaper` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `step_config_id` VARCHAR(191) NOT NULL,
    `content` JSON NULL,
    `approval_status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `current_version` INTEGER NOT NULL DEFAULT 0,
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `approved_version` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `planning_workpaper_engagement_id_idx`(`engagement_id`),
    UNIQUE INDEX `planning_workpaper_engagement_id_step_config_id_key`(`engagement_id`, `step_config_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_entity_binding` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `workflow_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,

    UNIQUE INDEX `approval_entity_binding_entity_type_key`(`entity_type`),
    INDEX `approval_entity_binding_workflow_id_idx`(`workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `engagement_objective_phase_idx` ON `engagement_objective`(`phase`);

-- CreateIndex
CREATE INDEX `engagement_objective_planning_ref_id_idx` ON `engagement_objective`(`planning_ref_id`);

-- CreateIndex
CREATE INDEX `engagement_procedure_phase_idx` ON `engagement_procedure`(`phase`);

-- CreateIndex
CREATE INDEX `engagement_procedure_planning_ref_id_idx` ON `engagement_procedure`(`planning_ref_id`);

-- CreateIndex
CREATE INDEX `engagement_section_phase_idx` ON `engagement_section`(`phase`);

-- CreateIndex
CREATE INDEX `engagement_section_planning_ref_id_idx` ON `engagement_section`(`planning_ref_id`);

-- AddForeignKey
ALTER TABLE `engagement_section` ADD CONSTRAINT `engagement_section_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_section`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_workpaper` ADD CONSTRAINT `planning_workpaper_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_workpaper` ADD CONSTRAINT `planning_workpaper_step_config_id_fkey` FOREIGN KEY (`step_config_id`) REFERENCES `planning_step_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_entity_binding` ADD CONSTRAINT `approval_entity_binding_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
