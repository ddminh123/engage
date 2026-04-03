import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import { seedRiskCatalog } from './seeds';

async function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = await createPrismaClient();

  console.log('🌱 Seeding database...');

  // =========================================================================
  // 1. System Roles
  // =========================================================================
  const roles = [
    { name: 'CAE', description: 'Chief Audit Executive — full system access', is_system: true },
    { name: 'Admin', description: 'System administrator — settings and user management', is_system: true },
    { name: 'Audit Director', description: 'Audit Director — oversees audit engagements', is_system: true },
    { name: 'Audit Manager', description: 'Audit Manager — manages audit teams', is_system: true },
    { name: 'Senior Auditor', description: 'Senior Auditor — leads audit procedures', is_system: true },
    { name: 'Auditor', description: 'Auditor — performs audit work', is_system: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded');

  // =========================================================================
  // 2. Seed Users (Admin + CAE)
  // =========================================================================
  const passwordHash = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@engage.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@engage.local',
      password_hash: passwordHash,
      role: 'admin',
      title: 'Quản trị viên',
      status: 'active',
      provider: 'credentials',
    },
  });

  const caeUser = await prisma.user.upsert({
    where: { email: 'cae@engage.local' },
    update: {},
    create: {
      name: 'CAE',
      email: 'cae@engage.local',
      password_hash: passwordHash,
      role: 'cae',
      title: 'Trưởng KTNB',
      status: 'active',
      provider: 'credentials',
    },
  });

  console.log(`✅ Users seeded: ${adminUser.name} (${adminUser.email}), ${caeUser.name} (${caeUser.email})`);

  // =========================================================================
  // 3. Assign system roles to users
  // =========================================================================
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const caeRole = await prisma.role.findUnique({ where: { name: 'CAE' } });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: adminUser.id, role_id: adminRole.id } },
      update: {},
      create: { user_id: adminUser.id, role_id: adminRole.id },
    });
  }

  if (caeRole) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: caeUser.id, role_id: caeRole.id } },
      update: {},
      create: { user_id: caeUser.id, role_id: caeRole.id },
    });
  }

  console.log('✅ User roles assigned');

  // =========================================================================
  // 4. Default Expertise entries
  // =========================================================================
  const expertises = [
    { label: 'Kiểm toán CNTT', code: 'IT', sort_order: 1 },
    { label: 'Kiểm toán tài chính', code: 'FIN', sort_order: 2 },
    { label: 'Kiểm toán vận hành', code: 'OPS', sort_order: 3 },
    { label: 'Kiểm toán tuân thủ', code: 'COMP', sort_order: 4 },
    { label: 'Quản lý rủi ro', code: 'RISK', sort_order: 5 },
    { label: 'Phân tích dữ liệu', code: 'DATA', sort_order: 6 },
  ];

  for (const exp of expertises) {
    await prisma.expertise.upsert({
      where: { code: exp.code },
      update: {},
      create: exp,
    });
  }
  console.log('✅ Expertise entries seeded');

  // =========================================================================
  // 5. Risk Catalogue Items — MIGRATED to prisma/seeds/ (COBIT + COSO)
  // Old RiskCatalogueItem model replaced by RiskCatalogItem with domains/categories.
  // See seedRiskCatalog() called at the end of this file.
  // =========================================================================

  // =========================================================================
  // 6. Default Planning Step Configs
  // =========================================================================
  const planningSteps = [
    { key: 'scope',         title: 'Phạm vi và Mục tiêu',        icon: 'FileText',     step_type: 'fixed',    sort_order: 0, is_active: true },
    { key: 'objectives',    title: 'Mục tiêu kiểm toán',        icon: 'Target',       step_type: 'fixed',    sort_order: 1, is_active: false },
    { key: 'understanding', title: 'Tìm hiểu đối tượng',        icon: 'BookOpen',     step_type: 'fixed',    sort_order: 2, is_active: true },
    { key: 'rcm',           title: 'Rủi ro & Kiểm soát (RACM)', icon: 'ShieldCheck',  step_type: 'fixed',    sort_order: 3, is_active: true },
    { key: 'work_program',  title: 'Chương trình kiểm toán',     icon: 'ClipboardList', step_type: 'fixed',   sort_order: 4, is_active: true },
  ];

  for (const step of planningSteps) {
    await prisma.planningStepConfig.upsert({
      where: { key: step.key },
      update: { title: step.title, icon: step.icon, is_active: step.is_active },
      create: step,
    });
  }
  console.log('✅ Planning step configs seeded');

  // =========================================================================
  // 7. Approval Statuses (dynamic status definitions)
  // =========================================================================

  const systemStatuses = [
    { key: 'not_started', label: 'Chưa bắt đầu', color: '#94a3b8', category: 'open', sort_order: 0 },
    { key: 'in_progress', label: 'Đang thực hiện', color: '#3b82f6', category: 'active', sort_order: 0 },
    { key: 'needs_modification', label: 'Cần chỉnh sửa', color: '#ef4444', category: 'active', sort_order: 1 },
    { key: 'waiting_review', label: 'Chờ soát xét', color: '#f59e0b', category: 'review', sort_order: 0 },
    { key: 'reviewed', label: 'Đã soát xét', color: '#10b981', category: 'review', sort_order: 1 },
    { key: 'waiting_approval', label: 'Đợi phê duyệt', color: '#8b5cf6', category: 'review', sort_order: 2 },
    { key: 'approved', label: 'Đã phê duyệt', color: '#10b981', category: 'done', sort_order: 0 },
  ];

  for (const s of systemStatuses) {
    await prisma.approvalStatus.upsert({
      where: { key: s.key },
      update: { label: s.label, color: s.color, category: s.category, sort_order: s.sort_order },
      create: { ...s, is_system: true },
    });
  }
  console.log('✅ Approval statuses seeded');

  // =========================================================================
  // 8. Default Approval Workflows
  // =========================================================================

  // --- Migrate stale 'draft' → 'not_started' in all approval transitions ---
  await prisma.approvalTransition.updateMany({
    where: { from_status: 'draft' },
    data: { from_status: 'not_started' },
  });
  await prisma.approvalTransition.updateMany({
    where: { to_status: 'draft' },
    data: { to_status: 'not_started' },
  });
  console.log('✅ Migrated draft → not_started in approval transitions');

  // --- 7a. Default 2-step workflow (used when entity has no explicit binding) ---
  // Unset any existing default first
  await prisma.approvalWorkflow.updateMany({
    where: { is_default: true },
    data: { is_default: false },
  });

  const defaultWorkflow = await prisma.approvalWorkflow.upsert({
    where: { entity_type: '__default__' },
    update: { is_default: true },
    create: {
      entity_type: '__default__',
      name: 'Quy trình soát xét mặc định',
      allow_self_approval: false,
      is_active: true,
      is_default: true,
    },
  });

  const defaultTransitions = [
    {
      from_status: 'not_started',
      to_status: 'in_progress',
      action_label: 'Bắt đầu',
      action_type: 'start',
      allowed_roles: ['*'],
      sort_order: 0,
      generates_signoff: false,
      signoff_type: null,
    },
    {
      from_status: 'in_progress',
      to_status: 'waiting_review',
      action_label: 'Gửi soát xét',
      action_type: 'submit',
      allowed_roles: ['*'],
      sort_order: 1,
      generates_signoff: true,
      signoff_type: 'prepare',
    },
    {
      from_status: 'waiting_review',
      to_status: 'reviewed',
      action_label: 'Soát xét xong',
      action_type: 'review',
      allowed_roles: ['reviewer', 'lead', 'audit_manager', 'audit_director', 'cae'],
      sort_order: 2,
      generates_signoff: true,
      signoff_type: 'review',
    },
    {
      from_status: 'waiting_review',
      to_status: 'needs_modification',
      action_label: 'Yêu cầu chỉnh sửa',
      action_type: 'reject',
      allowed_roles: ['reviewer', 'lead', 'audit_manager', 'audit_director', 'cae'],
      sort_order: 3,
      generates_signoff: false,
      signoff_type: null,
    },
    {
      from_status: 'needs_modification',
      to_status: 'waiting_review',
      action_label: 'Gửi lại soát xét',
      action_type: 'submit',
      allowed_roles: ['*'],
      sort_order: 4,
      generates_signoff: false,
      signoff_type: null,
    },
  ];

  for (const t of defaultTransitions) {
    await prisma.approvalTransition.upsert({
      where: {
        workflow_id_from_status_to_status: {
          workflow_id: defaultWorkflow.id,
          from_status: t.from_status,
          to_status: t.to_status,
        },
      },
      update: {
        action_label: t.action_label,
        allowed_roles: t.allowed_roles,
        sort_order: t.sort_order,
        generates_signoff: t.generates_signoff,
        signoff_type: t.signoff_type,
      },
      create: {
        workflow_id: defaultWorkflow.id,
        ...t,
      },
    });
  }
  // Cleanup: remove stale waiting_review → approved transition (replaced by waiting_review → reviewed)
  await prisma.approvalTransition.deleteMany({
    where: {
      workflow_id: defaultWorkflow.id,
      from_status: 'waiting_review',
      to_status: 'approved',
    },
  });
  console.log('✅ Default approval workflow seeded');

  // --- Entity binding: planning_workpaper → default workflow ---
  await prisma.approvalEntityBinding.upsert({
    where: { entity_type: 'planning_workpaper' },
    update: { workflow_id: defaultWorkflow.id },
    create: {
      entity_type: 'planning_workpaper',
      workflow_id: defaultWorkflow.id,
      label: 'Giấy tờ kế hoạch',
    },
  });
  console.log('✅ Planning workpaper entity binding seeded');

  // --- 7b. Procedure-specific workflow (existing, with review step) ---
  const procedureWorkflow = await prisma.approvalWorkflow.upsert({
    where: { entity_type: 'procedure' },
    update: {},
    create: {
      entity_type: 'procedure',
      name: 'Soát xét thủ tục',
      allow_self_approval: false,
      is_active: true,
      is_default: false,
    },
  });

  // Create entity binding for procedure → this workflow
  await prisma.approvalEntityBinding.upsert({
    where: { entity_type: 'procedure' },
    update: {},
    create: {
      entity_type: 'procedure',
      workflow_id: procedureWorkflow.id,
      label: 'Thủ tục kiểm toán',
    },
  });

  const procedureTransitions = [
    {
      from_status: 'not_started',
      to_status: 'in_progress',
      action_label: 'Bắt đầu',
      action_type: 'start',
      allowed_roles: ['*'],
      sort_order: 0,
      generates_signoff: false,
      signoff_type: null,
    },
    {
      from_status: 'in_progress',
      to_status: 'waiting_review',
      action_label: 'Gửi soát xét',
      action_type: 'submit',
      allowed_roles: ['*'],
      sort_order: 1,
      generates_signoff: true,
      signoff_type: 'prepare',
    },
    {
      from_status: 'waiting_review',
      to_status: 'approved',
      action_label: 'Phê duyệt',
      action_type: 'approve',
      allowed_roles: ['reviewer', 'lead', 'audit_manager', 'audit_director', 'cae'],
      sort_order: 2,
      generates_signoff: true,
      signoff_type: 'approve',
    },
    {
      from_status: 'waiting_review',
      to_status: 'needs_modification',
      action_label: 'Yêu cầu chỉnh sửa',
      action_type: 'reject',
      allowed_roles: ['reviewer', 'lead', 'audit_manager', 'audit_director', 'cae'],
      sort_order: 3,
      generates_signoff: false,
      signoff_type: null,
    },
    {
      from_status: 'needs_modification',
      to_status: 'waiting_review',
      action_label: 'Gửi lại soát xét',
      action_type: 'submit',
      allowed_roles: ['*'],
      sort_order: 4,
      generates_signoff: false,
      signoff_type: null,
    },
  ];

  for (const t of procedureTransitions) {
    await prisma.approvalTransition.upsert({
      where: {
        workflow_id_from_status_to_status: {
          workflow_id: procedureWorkflow.id,
          from_status: t.from_status,
          to_status: t.to_status,
        },
      },
      update: {
        action_label: t.action_label,
        allowed_roles: t.allowed_roles,
        sort_order: t.sort_order,
        generates_signoff: t.generates_signoff,
        signoff_type: t.signoff_type,
      },
      create: {
        workflow_id: procedureWorkflow.id,
        ...t,
      },
    });
  }
  console.log('✅ Procedure approval workflow seeded');

  // =========================================================================
  // Risk Catalog Library (COBIT 2019 + COSO ERM — banking focus)
  // =========================================================================
  await seedRiskCatalog(prisma);

  console.log('🌱 Seeding complete!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
