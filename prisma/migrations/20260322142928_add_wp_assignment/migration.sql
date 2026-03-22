-- CreateTable
CREATE TABLE `wp_assignment` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wp_assignment_engagement_id_idx`(`engagement_id`),
    INDEX `wp_assignment_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    UNIQUE INDEX `wp_assignment_user_id_entity_type_entity_id_key`(`user_id`, `entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wp_assignment` ADD CONSTRAINT `wp_assignment_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_assignment` ADD CONSTRAINT `wp_assignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
