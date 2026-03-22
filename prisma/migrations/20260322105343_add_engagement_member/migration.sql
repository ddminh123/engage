-- CreateTable
CREATE TABLE `engagement_member` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `engagement_member_user_id_idx`(`user_id`),
    PRIMARY KEY (`engagement_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `engagement_member` ADD CONSTRAINT `engagement_member_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_member` ADD CONSTRAINT `engagement_member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
