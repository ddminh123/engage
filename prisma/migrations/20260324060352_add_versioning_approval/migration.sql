-- AlterTable
ALTER TABLE `engagement_procedure` ADD COLUMN `approval_status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `approved_by` VARCHAR(191) NULL,
    ADD COLUMN `approved_version` INTEGER NULL,
    ADD COLUMN `content` JSON NULL,
    ADD COLUMN `current_version` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `entity_version` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `comment` TEXT NULL,
    `published_by` VARCHAR(191) NOT NULL,
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `entity_version_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `entity_version_published_by_idx`(`published_by`),
    INDEX `entity_version_published_at_idx`(`published_at`),
    UNIQUE INDEX `entity_version_entity_type_entity_id_version_key`(`entity_type`, `entity_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_workflow` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `allow_self_approval` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `approval_workflow_entity_type_key`(`entity_type`),
    INDEX `approval_workflow_entity_type_idx`(`entity_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_transition` (
    `id` VARCHAR(191) NOT NULL,
    `workflow_id` VARCHAR(191) NOT NULL,
    `from_status` VARCHAR(191) NOT NULL,
    `to_status` VARCHAR(191) NOT NULL,
    `action_label` VARCHAR(191) NOT NULL,
    `action_type` VARCHAR(191) NOT NULL,
    `allowed_roles` JSON NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `approval_transition_workflow_id_idx`(`workflow_id`),
    UNIQUE INDEX `approval_transition_workflow_id_from_status_to_status_key`(`workflow_id`, `from_status`, `to_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_comment_thread` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `thread_type` VARCHAR(191) NOT NULL DEFAULT 'comment',
    `quote` TEXT NULL,
    `content_anchor` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wp_comment_thread_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `wp_comment_thread_status_idx`(`status`),
    INDEX `wp_comment_thread_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wp_comment` (
    `id` VARCHAR(191) NOT NULL,
    `thread_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wp_comment_thread_id_idx`(`thread_id`),
    INDEX `wp_comment_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `template_category_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `content` JSON NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `template_entity_type_idx`(`entity_type`),
    INDEX `template_category_id_idx`(`category_id`),
    INDEX `template_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entity_version` ADD CONSTRAINT `entity_version_published_by_fkey` FOREIGN KEY (`published_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_transition` ADD CONSTRAINT `approval_transition_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_comment_thread` ADD CONSTRAINT `wp_comment_thread_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_comment` ADD CONSTRAINT `wp_comment_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `wp_comment_thread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_comment` ADD CONSTRAINT `wp_comment_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_category` ADD CONSTRAINT `template_category_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `template_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template` ADD CONSTRAINT `template_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `template_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template` ADD CONSTRAINT `template_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
