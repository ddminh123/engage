import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

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
    { name: 'Team Owner', description: 'Team lead — manages own team', is_system: true },
    { name: 'Team Member', description: 'Team member — access per team assignments', is_system: true },
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
  // 5. Risk Catalogue Items
  // =========================================================================
  const riskCatalogueItems = [
    // Operational risks
    { name: 'Rủi ro gian lận nội bộ', code: 'OPS-001', risk_type: 'operational', risk_domain: 'fraud', sort_order: 1 },
    { name: 'Rủi ro quy trình không hiệu quả', code: 'OPS-002', risk_type: 'operational', risk_domain: 'operations', sort_order: 2 },
    { name: 'Rủi ro nhân sự chủ chốt', code: 'OPS-003', risk_type: 'operational', risk_domain: 'operations', sort_order: 3 },
    // Technology risks
    { name: 'Rủi ro an ninh mạng', code: 'TECH-001', risk_type: 'technology', risk_domain: 'IT', sort_order: 4 },
    { name: 'Rủi ro mất dữ liệu', code: 'TECH-002', risk_type: 'technology', risk_domain: 'IT', sort_order: 5 },
    { name: 'Rủi ro hệ thống gián đoạn', code: 'TECH-003', risk_type: 'technology', risk_domain: 'IT', sort_order: 6 },
    // Compliance risks
    { name: 'Vi phạm quy định pháp luật', code: 'COMP-001', risk_type: 'compliance', risk_domain: 'regulatory', sort_order: 7 },
    { name: 'Vi phạm chính sách nội bộ', code: 'COMP-002', risk_type: 'compliance', risk_domain: 'regulatory', sort_order: 8 },
    // Credit risks
    { name: 'Rủi ro tín dụng khách hàng', code: 'CRED-001', risk_type: 'credit', risk_domain: 'financial_reporting', sort_order: 9 },
    { name: 'Rủi ro nợ xấu', code: 'CRED-002', risk_type: 'credit', risk_domain: 'financial_reporting', sort_order: 10 },
    // Strategic risks
    { name: 'Rủi ro chiến lược kinh doanh', code: 'STRAT-001', risk_type: 'strategic', risk_domain: 'operations', sort_order: 11 },
    // ESG domain
    { name: 'Rủi ro môi trường', code: 'ESG-001', risk_type: 'operational', risk_domain: 'ESG', sort_order: 12 },
    { name: 'Rủi ro trách nhiệm xã hội', code: 'ESG-002', risk_type: 'compliance', risk_domain: 'ESG', sort_order: 13 },
    { name: 'Rủi ro quản trị doanh nghiệp', code: 'ESG-003', risk_type: 'strategic', risk_domain: 'ESG', sort_order: 14 },
    // Financial reporting
    { name: 'Sai sót báo cáo tài chính', code: 'FIN-001', risk_type: 'operational', risk_domain: 'financial_reporting', sort_order: 15 },
  ];

  for (const item of riskCatalogueItems) {
    await prisma.riskCatalogueItem.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }
  console.log('✅ Risk catalogue items seeded');

  console.log('🌱 Seeding complete!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
