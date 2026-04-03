-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `changes` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_log_user_id_idx`(`user_id`),
    INDEX `audit_log_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `unit_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `contact_status_idx`(`status`),
    INDEX `contact_unit_id_idx`(`unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_unit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `leader_id` VARCHAR(191) NULL,
    `contact_point_id` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `established` DATETIME(3) NULL,
    `discontinued` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `org_unit_code_key`(`code`),
    INDEX `org_unit_parent_id_idx`(`parent_id`),
    INDEX `org_unit_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'auditor',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `provider` VARCHAR(191) NOT NULL DEFAULT 'credentials',
    `supervisor_id` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `avatar_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_status_idx`(`status`),
    INDEX `user_role_idx`(`role`),
    INDEX `user_supervisor_id_idx`(`supervisor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `team_name_key`(`name`),
    INDEX `team_owner_id_idx`(`owner_id`),
    INDEX `team_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_member` (
    `team_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_member_user_id_idx`(`user_id`),
    PRIMARY KEY (`team_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `user_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,

    INDEX `user_role_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,

    INDEX `permission_role_id_idx`(`role_id`),
    UNIQUE INDEX `permission_role_id_module_action_key`(`role_id`, `module`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expertise` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expertise_code_key`(`code`),
    INDEX `expertise_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_expertise` (
    `user_id` VARCHAR(191) NOT NULL,
    `expertise_id` VARCHAR(191) NOT NULL,

    INDEX `user_expertise_expertise_id_idx`(`expertise_id`),
    PRIMARY KEY (`user_id`, `expertise_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entity_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entity_type_code_key`(`code`),
    INDEX `entity_type_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_area` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `audit_area_code_key`(`code`),
    INDEX `audit_area_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `entity_type_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `audit_cycle` VARCHAR(191) NULL,
    `risk_score` INTEGER NULL,
    `risk_level` VARCHAR(191) NULL,
    `inherent_risk_score` INTEGER NULL,
    `inherent_risk_level` VARCHAR(191) NULL,
    `last_audited_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `auditable_entity_code_key`(`code`),
    INDEX `auditable_entity_entity_type_id_idx`(`entity_type_id`),
    INDEX `auditable_entity_status_idx`(`status`),
    INDEX `auditable_entity_risk_level_idx`(`risk_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_area` (
    `entity_id` VARCHAR(191) NOT NULL,
    `area_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_owner` (
    `entity_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_participant` (
    `entity_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_contact_point` (
    `entity_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_audit_sponsor` (
    `entity_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditable_entity_auditee_rep` (
    `entity_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_assessment` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `inherent_score` INTEGER NOT NULL,
    `inherent_level` VARCHAR(191) NOT NULL,
    `inherent_impact` INTEGER NULL,
    `inherent_likelihood` INTEGER NULL,
    `impact_rationale` TEXT NULL,
    `likelihood_rationale` TEXT NULL,
    `control_effectiveness` VARCHAR(191) NULL,
    `control_rationale` TEXT NULL,
    `risk_factors` JSON NULL,
    `assessment_source_id` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `management_request` BOOLEAN NOT NULL DEFAULT false,
    `residual_score` INTEGER NULL,
    `residual_level` VARCHAR(191) NULL,
    `conclusion` TEXT NULL,
    `evaluated_by` VARCHAR(191) NULL,
    `approved_by` VARCHAR(191) NULL,
    `evaluation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `risk_assessment_entity_id_idx`(`entity_id`),
    INDEX `risk_assessment_evaluation_date_idx`(`evaluation_date`),
    INDEX `risk_assessment_assessment_source_id_idx`(`assessment_source_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_source` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assessment_source_code_key`(`code`),
    INDEX `assessment_source_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_assessment_factor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `relates_to` VARCHAR(191) NOT NULL DEFAULT 'impact',
    `is_positive` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_assessment_factor_code_key`(`code`),
    INDEX `risk_assessment_factor_is_active_idx`(`is_active`),
    INDEX `risk_assessment_factor_relates_to_idx`(`relates_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_catalog_domain` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `framework` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_catalog_domain_code_key`(`code`),
    INDEX `risk_catalog_domain_framework_idx`(`framework`),
    INDEX `risk_catalog_domain_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_catalog_category` (
    `id` VARCHAR(191) NOT NULL,
    `domain_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_catalog_category_code_key`(`code`),
    INDEX `risk_catalog_category_domain_id_idx`(`domain_id`),
    INDEX `risk_catalog_category_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_catalog_item` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `risk_type` VARCHAR(191) NULL,
    `risk_rating` VARCHAR(191) NULL,
    `likelihood` VARCHAR(191) NULL,
    `impact` VARCHAR(191) NULL,
    `framework_ref` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'system',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_catalog_item_code_key`(`code`),
    INDEX `risk_catalog_item_category_id_idx`(`category_id`),
    INDEX `risk_catalog_item_source_idx`(`source`),
    INDEX `risk_catalog_item_risk_type_idx`(`risk_type`),
    INDEX `risk_catalog_item_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `control_catalog_item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `control_type` VARCHAR(191) NULL,
    `control_nature` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,
    `framework_ref` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'system',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `control_catalog_item_code_key`(`code`),
    INDEX `control_catalog_item_source_idx`(`source`),
    INDEX `control_catalog_item_control_type_idx`(`control_type`),
    INDEX `control_catalog_item_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_catalog_item` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `procedure_type` VARCHAR(191) NULL,
    `procedure_category` VARCHAR(191) NULL,
    `framework_ref` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'system',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `procedure_catalog_item_code_key`(`code`),
    INDEX `procedure_catalog_item_source_idx`(`source`),
    INDEX `procedure_catalog_item_procedure_type_idx`(`procedure_type`),
    INDEX `procedure_catalog_item_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_control_catalog_ref` (
    `risk_catalog_id` VARCHAR(191) NOT NULL,
    `control_catalog_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`risk_catalog_id`, `control_catalog_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `control_procedure_catalog_ref` (
    `control_catalog_id` VARCHAR(191) NOT NULL,
    `procedure_catalog_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`control_catalog_id`, `procedure_catalog_id`)
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
    `scope` TEXT NULL,
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

-- CreateTable
CREATE TABLE `planned_audit_owner` (
    `planned_audit_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`planned_audit_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planned_audit_participant` (
    `planned_audit_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`planned_audit_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planned_audit_contact_point` (
    `planned_audit_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`planned_audit_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planned_audit_auditee_rep` (
    `planned_audit_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`planned_audit_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `planned_audit_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'planning',
    `objective` TEXT NULL,
    `scope` TEXT NULL,
    `understanding` TEXT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `estimated_days` INTEGER NULL,
    `priority` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `wp_approval_status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `wp_approved_by` VARCHAR(191) NULL,
    `wp_approved_at` DATETIME(3) NULL,
    `wp_approved_version` INTEGER NULL,
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
CREATE TABLE `engagement_owner` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`engagement_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_participant` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`engagement_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_contact_point` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`engagement_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_auditee_rep` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`engagement_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_member` (
    `engagement_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `engagement_member_user_id_idx`(`user_id`),
    PRIMARY KEY (`engagement_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `wp_signoff` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `signoff_type` VARCHAR(191) NOT NULL,
    `signoff_order` INTEGER NOT NULL DEFAULT 1,
    `user_id` VARCHAR(191) NOT NULL,
    `signed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NULL,
    `transition_id` VARCHAR(191) NULL,
    `invalidated_at` DATETIME(3) NULL,
    `invalidated_by` VARCHAR(191) NULL,
    `invalidation_reason` VARCHAR(191) NULL,
    `comment` TEXT NULL,

    INDEX `wp_signoff_engagement_id_idx`(`engagement_id`),
    INDEX `wp_signoff_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `wp_signoff_signoff_type_idx`(`signoff_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `engagement_rcm_objective` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `audit_objective_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_rcm_objective_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_rcm_objective_audit_objective_id_idx`(`audit_objective_id`),
    INDEX `engagement_rcm_objective_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_risk` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `rcm_objective_id` VARCHAR(191) NULL,
    `catalog_risk_id` VARCHAR(191) NULL,
    `risk_description` TEXT NOT NULL,
    `risk_rating` VARCHAR(191) NULL,
    `risk_category` VARCHAR(191) NULL,
    `likelihood` VARCHAR(191) NULL,
    `impact` VARCHAR(191) NULL,
    `workpaper_content` JSON NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_risk_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_risk_rcm_objective_id_idx`(`rcm_objective_id`),
    INDEX `engagement_risk_catalog_risk_id_idx`(`catalog_risk_id`),
    INDEX `engagement_risk_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_control` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `catalog_control_id` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `effectiveness` VARCHAR(191) NULL,
    `control_type` VARCHAR(191) NULL,
    `control_nature` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,
    `workpaper_content` JSON NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_control_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_control_catalog_control_id_idx`(`catalog_control_id`),
    INDEX `engagement_control_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_control_ref` (
    `risk_id` VARCHAR(191) NOT NULL,
    `control_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`risk_id`, `control_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_section` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    `planning_ref_id` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `review_notes` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_section_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_section_phase_idx`(`phase`),
    INDEX `engagement_section_planning_ref_id_idx`(`planning_ref_id`),
    INDEX `engagement_section_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_objective` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    `planning_ref_id` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `review_notes` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `engagement_objective_engagement_id_idx`(`engagement_id`),
    INDEX `engagement_objective_section_id_idx`(`section_id`),
    INDEX `engagement_objective_phase_idx`(`phase`),
    INDEX `engagement_objective_planning_ref_id_idx`(`planning_ref_id`),
    INDEX `engagement_objective_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `engagement_procedure` (
    `id` VARCHAR(191) NOT NULL,
    `engagement_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NULL,
    `objective_id` VARCHAR(191) NULL,
    `catalog_procedure_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `procedures` TEXT NULL,
    `procedure_type` VARCHAR(191) NULL,
    `procedure_category` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `approval_status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
    `current_version` INTEGER NOT NULL DEFAULT 0,
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `approved_version` INTEGER NULL,
    `phase` VARCHAR(191) NOT NULL DEFAULT 'planning',
    `planning_ref_id` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'planned',
    `observations` TEXT NULL,
    `conclusion` TEXT NULL,
    `effectiveness` VARCHAR(191) NULL,
    `sample_size` INTEGER NULL,
    `exceptions` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `priority` VARCHAR(191) NULL,
    `content` JSON NULL,
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
    INDEX `engagement_procedure_catalog_procedure_id_idx`(`catalog_procedure_id`),
    INDEX `engagement_procedure_phase_idx`(`phase`),
    INDEX `engagement_procedure_planning_ref_id_idx`(`planning_ref_id`),
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
    `evidence` TEXT NULL,
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

-- CreateTable
CREATE TABLE `draft_finding_risk_owner` (
    `finding_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`finding_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draft_finding_unit_owner` (
    `finding_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`finding_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_control_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `control_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `control_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_risk_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `risk_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `risk_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_objective_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `rcm_objective_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `rcm_objective_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `approval_status` VARCHAR(191) NOT NULL DEFAULT 'not_started',
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
CREATE TABLE `entity_version` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `version_type` VARCHAR(191) NULL,
    `action_label` VARCHAR(191) NULL,
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
CREATE TABLE `approval_status` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#94a3b8',
    `category` VARCHAR(191) NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `approval_status_key_key`(`key`),
    INDEX `approval_status_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_workflow` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `allow_self_approval` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `approval_workflow_entity_type_key`(`entity_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_entity_binding` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `sub_type` VARCHAR(191) NOT NULL DEFAULT '',
    `workflow_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,

    INDEX `approval_entity_binding_workflow_id_idx`(`workflow_id`),
    UNIQUE INDEX `approval_entity_binding_entity_type_sub_type_key`(`entity_type`, `sub_type`),
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
    `generates_signoff` BOOLEAN NOT NULL DEFAULT false,
    `signoff_type` VARCHAR(191) NULL,

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

-- CreateTable
CREATE TABLE `template_entity_binding` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `sub_type` VARCHAR(191) NOT NULL DEFAULT '',
    `template_id` VARCHAR(191) NOT NULL,

    INDEX `template_entity_binding_template_id_idx`(`template_id`),
    UNIQUE INDEX `template_entity_binding_entity_type_sub_type_key`(`entity_type`, `sub_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_unit` ADD CONSTRAINT `org_unit_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `org_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_unit` ADD CONSTRAINT `org_unit_leader_id_fkey` FOREIGN KEY (`leader_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_unit` ADD CONSTRAINT `org_unit_contact_point_id_fkey` FOREIGN KEY (`contact_point_id`) REFERENCES `contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team` ADD CONSTRAINT `team_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role` ADD CONSTRAINT `user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission` ADD CONSTRAINT `permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_expertise` ADD CONSTRAINT `user_expertise_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_expertise` ADD CONSTRAINT `user_expertise_expertise_id_fkey` FOREIGN KEY (`expertise_id`) REFERENCES `expertise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity` ADD CONSTRAINT `auditable_entity_entity_type_id_fkey` FOREIGN KEY (`entity_type_id`) REFERENCES `entity_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_area` ADD CONSTRAINT `auditable_entity_area_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_area` ADD CONSTRAINT `auditable_entity_area_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `audit_area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_owner` ADD CONSTRAINT `auditable_entity_owner_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_owner` ADD CONSTRAINT `auditable_entity_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_participant` ADD CONSTRAINT `auditable_entity_participant_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_participant` ADD CONSTRAINT `auditable_entity_participant_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_contact_point` ADD CONSTRAINT `auditable_entity_contact_point_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_contact_point` ADD CONSTRAINT `auditable_entity_contact_point_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_audit_sponsor` ADD CONSTRAINT `auditable_entity_audit_sponsor_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_audit_sponsor` ADD CONSTRAINT `auditable_entity_audit_sponsor_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_auditee_rep` ADD CONSTRAINT `auditable_entity_auditee_rep_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_auditee_rep` ADD CONSTRAINT `auditable_entity_auditee_rep_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessment` ADD CONSTRAINT `risk_assessment_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessment` ADD CONSTRAINT `risk_assessment_assessment_source_id_fkey` FOREIGN KEY (`assessment_source_id`) REFERENCES `assessment_source`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_catalog_category` ADD CONSTRAINT `risk_catalog_category_domain_id_fkey` FOREIGN KEY (`domain_id`) REFERENCES `risk_catalog_domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_catalog_item` ADD CONSTRAINT `risk_catalog_item_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `risk_catalog_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_control_catalog_ref` ADD CONSTRAINT `risk_control_catalog_ref_risk_catalog_id_fkey` FOREIGN KEY (`risk_catalog_id`) REFERENCES `risk_catalog_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_control_catalog_ref` ADD CONSTRAINT `risk_control_catalog_ref_control_catalog_id_fkey` FOREIGN KEY (`control_catalog_id`) REFERENCES `control_catalog_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control_procedure_catalog_ref` ADD CONSTRAINT `control_procedure_catalog_ref_control_catalog_id_fkey` FOREIGN KEY (`control_catalog_id`) REFERENCES `control_catalog_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control_procedure_catalog_ref` ADD CONSTRAINT `control_procedure_catalog_ref_procedure_catalog_id_fkey` FOREIGN KEY (`procedure_catalog_id`) REFERENCES `procedure_catalog_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entity_risk` ADD CONSTRAINT `entity_risk_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entity_risk` ADD CONSTRAINT `entity_risk_catalogue_item_id_fkey` FOREIGN KEY (`catalogue_item_id`) REFERENCES `risk_catalog_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit` ADD CONSTRAINT `planned_audit_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `audit_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit` ADD CONSTRAINT `planned_audit_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_owner` ADD CONSTRAINT `planned_audit_owner_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_owner` ADD CONSTRAINT `planned_audit_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_participant` ADD CONSTRAINT `planned_audit_participant_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_participant` ADD CONSTRAINT `planned_audit_participant_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_contact_point` ADD CONSTRAINT `planned_audit_contact_point_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_contact_point` ADD CONSTRAINT `planned_audit_contact_point_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_auditee_rep` ADD CONSTRAINT `planned_audit_auditee_rep_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planned_audit_auditee_rep` ADD CONSTRAINT `planned_audit_auditee_rep_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement` ADD CONSTRAINT `engagement_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement` ADD CONSTRAINT `engagement_planned_audit_id_fkey` FOREIGN KEY (`planned_audit_id`) REFERENCES `planned_audit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_owner` ADD CONSTRAINT `engagement_owner_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_owner` ADD CONSTRAINT `engagement_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_participant` ADD CONSTRAINT `engagement_participant_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_participant` ADD CONSTRAINT `engagement_participant_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_contact_point` ADD CONSTRAINT `engagement_contact_point_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_contact_point` ADD CONSTRAINT `engagement_contact_point_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_auditee_rep` ADD CONSTRAINT `engagement_auditee_rep_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_auditee_rep` ADD CONSTRAINT `engagement_auditee_rep_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_member` ADD CONSTRAINT `engagement_member_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_member` ADD CONSTRAINT `engagement_member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_assignment` ADD CONSTRAINT `wp_assignment_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_assignment` ADD CONSTRAINT `wp_assignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_signoff` ADD CONSTRAINT `wp_signoff_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wp_signoff` ADD CONSTRAINT `wp_signoff_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_objective` ADD CONSTRAINT `audit_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_rcm_objective` ADD CONSTRAINT `engagement_rcm_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_rcm_objective` ADD CONSTRAINT `engagement_rcm_objective_audit_objective_id_fkey` FOREIGN KEY (`audit_objective_id`) REFERENCES `audit_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_rcm_objective_id_fkey` FOREIGN KEY (`rcm_objective_id`) REFERENCES `engagement_rcm_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_risk` ADD CONSTRAINT `engagement_risk_catalog_risk_id_fkey` FOREIGN KEY (`catalog_risk_id`) REFERENCES `risk_catalog_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_control` ADD CONSTRAINT `engagement_control_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_control` ADD CONSTRAINT `engagement_control_catalog_control_id_fkey` FOREIGN KEY (`catalog_control_id`) REFERENCES `control_catalog_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_control_ref` ADD CONSTRAINT `risk_control_ref_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `engagement_risk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_control_ref` ADD CONSTRAINT `risk_control_ref_control_id_fkey` FOREIGN KEY (`control_id`) REFERENCES `engagement_control`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_section` ADD CONSTRAINT `engagement_section_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_section` ADD CONSTRAINT `engagement_section_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_section`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `engagement_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_objective`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `engagement_section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_objective_id_fkey` FOREIGN KEY (`objective_id`) REFERENCES `engagement_objective`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_catalog_procedure_id_fkey` FOREIGN KEY (`catalog_procedure_id`) REFERENCES `procedure_catalog_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagement_procedure` ADD CONSTRAINT `engagement_procedure_planning_ref_id_fkey` FOREIGN KEY (`planning_ref_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding` ADD CONSTRAINT `draft_finding_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_procedure` ADD CONSTRAINT `draft_finding_procedure_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_procedure` ADD CONSTRAINT `draft_finding_procedure_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_risk_owner` ADD CONSTRAINT `draft_finding_risk_owner_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_risk_owner` ADD CONSTRAINT `draft_finding_risk_owner_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_unit_owner` ADD CONSTRAINT `draft_finding_unit_owner_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_unit_owner` ADD CONSTRAINT `draft_finding_unit_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_control_ref` ADD CONSTRAINT `procedure_control_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_control_ref` ADD CONSTRAINT `procedure_control_ref_control_id_fkey` FOREIGN KEY (`control_id`) REFERENCES `engagement_control`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_risk_ref` ADD CONSTRAINT `procedure_risk_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_risk_ref` ADD CONSTRAINT `procedure_risk_ref_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `engagement_risk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_objective_ref` ADD CONSTRAINT `procedure_objective_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_objective_ref` ADD CONSTRAINT `procedure_objective_ref_rcm_objective_id_fkey` FOREIGN KEY (`rcm_objective_id`) REFERENCES `engagement_rcm_objective`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_workpaper` ADD CONSTRAINT `planning_workpaper_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_workpaper` ADD CONSTRAINT `planning_workpaper_step_config_id_fkey` FOREIGN KEY (`step_config_id`) REFERENCES `planning_step_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entity_version` ADD CONSTRAINT `entity_version_published_by_fkey` FOREIGN KEY (`published_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_entity_binding` ADD CONSTRAINT `approval_entity_binding_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `template_entity_binding` ADD CONSTRAINT `template_entity_binding_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
