import type { PrismaClient } from '../../src/generated/prisma/client';

// =============================================================================
// TIPTAP JSON BUILDERS
// =============================================================================

function heading(text: string, level: 1 | 2 | 3 = 2) {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  };
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text,
        marks: [{ type: 'italic' }],
      },
    ],
  };
}

function emptyParagraph() {
  return { type: 'paragraph' };
}

function doc(...nodes: Record<string, unknown>[]) {
  return { type: 'doc', content: nodes };
}

// =============================================================================
// TEMPLATE CONTENT
// =============================================================================

const procedureContent = doc(
  heading('Mô tả chi tiết', 2),
  paragraph('[Mô tả chi tiết mục tiêu và phạm vi của thủ tục kiểm toán này]'),
  emptyParagraph(),
  heading('Thủ tục thực hiện', 2),
  paragraph('[Liệt kê các bước thực hiện thủ tục kiểm toán, bao gồm phương pháp thu thập bằng chứng, mẫu kiểm tra, và tiêu chí đánh giá]'),
  emptyParagraph(),
  heading('Quan sát / Kết quả', 2),
  paragraph('[Ghi nhận các quan sát, phát hiện và kết quả thu được trong quá trình thực hiện thủ tục]'),
  emptyParagraph(),
  heading('Kết luận', 2),
  paragraph('[Tổng hợp kết luận về tính hiệu quả của kiểm soát, mức độ rủi ro còn lại, và các khuyến nghị (nếu có)]'),
  emptyParagraph(),
);

const scopeContent = doc(
  heading('Phạm vi kiểm toán', 2),
  paragraph('[Xác định phạm vi kiểm toán, bao gồm đơn vị/quy trình/hệ thống được kiểm toán và khoảng thời gian đánh giá]'),
  emptyParagraph(),
  heading('Mục tiêu kiểm toán', 2),
  paragraph('[Nêu rõ các mục tiêu kiểm toán cần đạt được, bao gồm mục tiêu đảm bảo và mục tiêu tư vấn]'),
  emptyParagraph(),
  heading('Giới hạn phạm vi', 2),
  paragraph('[Ghi nhận các giới hạn phạm vi, hạn chế tiếp cận, hoặc các vấn đề ảnh hưởng đến kết quả kiểm toán]'),
  emptyParagraph(),
  heading('Phương pháp tiếp cận', 2),
  paragraph('[Mô tả phương pháp kiểm toán sẽ áp dụng: kiểm toán dựa trên rủi ro, phương pháp chọn mẫu, công cụ phân tích dữ liệu, v.v.]'),
  emptyParagraph(),
);

const understandingContent = doc(
  heading('Mô tả hoạt động', 2),
  paragraph('[Mô tả tổng quan về hoạt động/quy trình/đơn vị được kiểm toán, bao gồm chức năng, quy mô và cơ cấu tổ chức]'),
  emptyParagraph(),
  heading('Quy trình nghiệp vụ', 2),
  paragraph('[Mô tả chi tiết các quy trình nghiệp vụ chính, luồng công việc, và các bên liên quan]'),
  emptyParagraph(),
  heading('Kiểm soát nội bộ', 2),
  paragraph('[Nhận diện và mô tả các kiểm soát nội bộ hiện có, bao gồm kiểm soát phòng ngừa, phát hiện và sửa chữa]'),
  emptyParagraph(),
  heading('Đánh giá rủi ro', 2),
  paragraph('[Đánh giá sơ bộ các rủi ro chính liên quan đến hoạt động, bao gồm rủi ro cố hữu và rủi ro kiểm soát]'),
  emptyParagraph(),
);

// =============================================================================
// SEED FUNCTION
// =============================================================================

export async function seedTemplates(prisma: PrismaClient) {
  // Need a user to set as creator — use first admin/cae user
  const creator = await prisma.user.findFirst({
    where: { role: { in: ['admin', 'cae'] } },
    select: { id: true },
  });

  if (!creator) {
    console.log('⚠️  No admin/cae user found, skipping template seeds');
    return;
  }

  const templates = [
    {
      name: 'Mẫu thủ tục kiểm toán',
      description: 'Mẫu giấy tờ cho thủ tục kiểm toán, gồm 4 phần: mô tả, thủ tục, kết quả, kết luận',
      content: procedureContent,
      entity_type: 'procedure',
      bindings: [{ entity_type: 'procedure', sub_type: '' }],
    },
    {
      name: 'Mẫu phạm vi kiểm toán',
      description: 'Mẫu giấy tờ kế hoạch phạm vi kiểm toán, gồm 4 phần: phạm vi, mục tiêu, giới hạn, phương pháp',
      content: scopeContent,
      entity_type: 'planning_workpaper',
      bindings: [{ entity_type: 'planning_workpaper', sub_type: 'scope' }],
    },
    {
      name: 'Mẫu tìm hiểu đối tượng',
      description: 'Mẫu giấy tờ kế hoạch tìm hiểu đối tượng kiểm toán, gồm 4 phần: mô tả, quy trình, kiểm soát, rủi ro',
      content: understandingContent,
      entity_type: 'planning_workpaper',
      bindings: [{ entity_type: 'planning_workpaper', sub_type: 'understanding' }],
    },
  ];

  for (const tpl of templates) {
    // Upsert template by name
    const existing = await prisma.template.findFirst({
      where: { name: tpl.name },
      select: { id: true },
    });

    let templateId: string;

    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: {
          description: tpl.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: tpl.content as any,
          entity_type: tpl.entity_type,
        },
      });
      templateId = existing.id;
    } else {
      const created = await prisma.template.create({
        data: {
          name: tpl.name,
          description: tpl.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: tpl.content as any,
          entity_type: tpl.entity_type,
          created_by: creator.id,
          is_active: true,
        },
      });
      templateId = created.id;
    }

    // Upsert bindings
    for (const binding of tpl.bindings) {
      await prisma.templateEntityBinding.upsert({
        where: {
          entity_type_sub_type: {
            entity_type: binding.entity_type,
            sub_type: binding.sub_type,
          },
        },
        update: { template_id: templateId },
        create: {
          entity_type: binding.entity_type,
          sub_type: binding.sub_type,
          template_id: templateId,
        },
      });
    }
  }

  console.log('✅ Templates seeded (3 templates with bindings)');
}
