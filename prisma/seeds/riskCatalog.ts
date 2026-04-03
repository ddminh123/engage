// =============================================================================
// Risk Catalog Library — Seed Orchestrator
// =============================================================================

import { PrismaClient } from '../../src/generated/prisma/client';

import {
  cobitDomains,
  cobitCategories,
  cobitRisks,
  cobitControls,
  cobitProcedures,
  cobitRiskControlMappings,
  cobitControlProcedureMappings,
} from './cobit2019';

import {
  cosoDomains,
  cosoCategories,
  cosoRisks,
  cosoControls,
  cosoProcedures,
  cosoRiskControlMappings,
  cosoControlProcedureMappings,
} from './coso-erm';

import type {
  SeedDomain,
  SeedCategory,
  SeedRisk,
  SeedControl,
  SeedProcedure,
  SeedRiskControlMapping,
  SeedControlProcedureMapping,
} from './cobit2019';

export async function seedRiskCatalog(prisma: PrismaClient) {
  console.log('📚 Seeding Risk Catalog Library...');

  // Merge data from both frameworks
  const allDomains: SeedDomain[] = [...cobitDomains, ...cosoDomains];
  const allCategories: SeedCategory[] = [...cobitCategories, ...cosoCategories];
  const allRisks: SeedRisk[] = [...cobitRisks, ...cosoRisks];
  const allControls: SeedControl[] = [...cobitControls, ...cosoControls];
  const allProcedures: SeedProcedure[] = [...cobitProcedures, ...cosoProcedures];
  const allRiskControlMappings: SeedRiskControlMapping[] = [
    ...cobitRiskControlMappings,
    ...cosoRiskControlMappings,
  ];
  const allControlProcedureMappings: SeedControlProcedureMapping[] = [
    ...cobitControlProcedureMappings,
    ...cosoControlProcedureMappings,
  ];

  // =========================================================================
  // 1. Upsert Domains
  // =========================================================================
  const domainIdMap = new Map<string, string>(); // code → id

  for (const domain of allDomains) {
    const record = await prisma.riskCatalogDomain.upsert({
      where: { code: domain.code },
      update: {
        name: domain.name,
        framework: domain.framework,
        description: domain.description,
        sort_order: domain.sortOrder,
      },
      create: {
        code: domain.code,
        name: domain.name,
        framework: domain.framework,
        description: domain.description,
        sort_order: domain.sortOrder,
      },
    });
    domainIdMap.set(domain.code, record.id);
  }
  console.log(`  ✅ ${allDomains.length} domains upserted`);

  // =========================================================================
  // 2. Upsert Categories
  // =========================================================================
  const categoryIdMap = new Map<string, string>(); // code → id

  for (const category of allCategories) {
    const domainId = domainIdMap.get(category.domainCode);
    if (!domainId) {
      console.warn(`  ⚠️ Domain not found for category ${category.code}: ${category.domainCode}`);
      continue;
    }

    const record = await prisma.riskCatalogCategory.upsert({
      where: { code: category.code },
      update: {
        domain_id: domainId,
        name: category.name,
        description: category.description,
        sort_order: category.sortOrder,
      },
      create: {
        code: category.code,
        domain_id: domainId,
        name: category.name,
        description: category.description,
        sort_order: category.sortOrder,
      },
    });
    categoryIdMap.set(category.code, record.id);
  }
  console.log(`  ✅ ${allCategories.length} categories upserted`);

  // =========================================================================
  // 3. Upsert Risk Items
  // =========================================================================
  const riskIdMap = new Map<string, string>(); // code → id

  for (const risk of allRisks) {
    const categoryId = categoryIdMap.get(risk.categoryCode);
    if (!categoryId) {
      console.warn(`  ⚠️ Category not found for risk ${risk.code}: ${risk.categoryCode}`);
      continue;
    }

    const record = await prisma.riskCatalogItem.upsert({
      where: { code: risk.code },
      update: {
        category_id: categoryId,
        name: risk.name,
        description: risk.description,
        risk_type: risk.riskType,
        risk_rating: risk.riskRating,
        likelihood: risk.likelihood,
        impact: risk.impact,
        framework_ref: risk.frameworkRef,
        source: 'system',
      },
      create: {
        code: risk.code,
        category_id: categoryId,
        name: risk.name,
        description: risk.description,
        risk_type: risk.riskType,
        risk_rating: risk.riskRating,
        likelihood: risk.likelihood,
        impact: risk.impact,
        framework_ref: risk.frameworkRef,
        source: 'system',
      },
    });
    riskIdMap.set(risk.code, record.id);
  }
  console.log(`  ✅ ${allRisks.length} risks upserted`);

  // =========================================================================
  // 4. Upsert Control Items
  // =========================================================================
  const controlIdMap = new Map<string, string>(); // code → id

  for (const control of allControls) {
    const record = await prisma.controlCatalogItem.upsert({
      where: { code: control.code },
      update: {
        name: control.name,
        description: control.description,
        control_type: control.controlType,
        control_nature: control.controlNature,
        frequency: control.frequency,
        framework_ref: control.frameworkRef,
        source: 'system',
      },
      create: {
        code: control.code,
        name: control.name,
        description: control.description,
        control_type: control.controlType,
        control_nature: control.controlNature,
        frequency: control.frequency,
        framework_ref: control.frameworkRef,
        source: 'system',
      },
    });
    controlIdMap.set(control.code, record.id);
  }
  console.log(`  ✅ ${allControls.length} controls upserted`);

  // =========================================================================
  // 5. Upsert Procedure Items
  // =========================================================================
  const procedureIdMap = new Map<string, string>(); // code → id

  for (const procedure of allProcedures) {
    const record = await prisma.procedureCatalogItem.upsert({
      where: { code: procedure.code },
      update: {
        name: procedure.name,
        description: procedure.description,
        procedure_type: procedure.procedureType,
        procedure_category: procedure.procedureCategory,
        framework_ref: procedure.frameworkRef,
        source: 'system',
      },
      create: {
        code: procedure.code,
        name: procedure.name,
        description: procedure.description,
        procedure_type: procedure.procedureType,
        procedure_category: procedure.procedureCategory,
        framework_ref: procedure.frameworkRef,
        source: 'system',
      },
    });
    procedureIdMap.set(procedure.code, record.id);
  }
  console.log(`  ✅ ${allProcedures.length} procedures upserted`);

  // =========================================================================
  // 6. Upsert Risk ↔ Control Mappings (M:N)
  // =========================================================================
  let rcMappingCount = 0;

  for (const mapping of allRiskControlMappings) {
    const riskId = riskIdMap.get(mapping.riskCode);
    const controlId = controlIdMap.get(mapping.controlCode);

    if (!riskId) {
      console.warn(`  ⚠️ Risk not found for mapping: ${mapping.riskCode}`);
      continue;
    }
    if (!controlId) {
      console.warn(`  ⚠️ Control not found for mapping: ${mapping.controlCode}`);
      continue;
    }

    await prisma.riskControlCatalogRef.upsert({
      where: {
        risk_catalog_id_control_catalog_id: {
          risk_catalog_id: riskId,
          control_catalog_id: controlId,
        },
      },
      update: {},
      create: {
        risk_catalog_id: riskId,
        control_catalog_id: controlId,
      },
    });
    rcMappingCount++;
  }
  console.log(`  ✅ ${rcMappingCount} risk-control mappings upserted`);

  // =========================================================================
  // 7. Upsert Control ↔ Procedure Mappings (M:N)
  // =========================================================================
  let cpMappingCount = 0;

  for (const mapping of allControlProcedureMappings) {
    const controlId = controlIdMap.get(mapping.controlCode);
    const procedureId = procedureIdMap.get(mapping.procedureCode);

    if (!controlId) {
      console.warn(`  ⚠️ Control not found for mapping: ${mapping.controlCode}`);
      continue;
    }
    if (!procedureId) {
      console.warn(`  ⚠️ Procedure not found for mapping: ${mapping.procedureCode}`);
      continue;
    }

    await prisma.controlProcedureCatalogRef.upsert({
      where: {
        control_catalog_id_procedure_catalog_id: {
          control_catalog_id: controlId,
          procedure_catalog_id: procedureId,
        },
      },
      update: {},
      create: {
        control_catalog_id: controlId,
        procedure_catalog_id: procedureId,
      },
    });
    cpMappingCount++;
  }
  console.log(`  ✅ ${cpMappingCount} control-procedure mappings upserted`);

  console.log('📚 Risk Catalog Library seeding complete!');
}
