export const SETTINGS_NAV_ITEMS = [
  { label: "Thông tin", href: "/settings" },
  { label: "Người dùng", href: "/settings/users" },
  { label: "Cơ cấu tổ chức", href: "/settings/org-chart" },
  { label: "Danh bạ", href: "/settings/contacts" },
  { label: "Dữ liệu gốc", href: "/settings/reference-data" },
  { label: "Phạm vi tổng thể", href: "/settings/universe" },
  { label: "Kế hoạch", href: "/settings/plan" },
  { label: "Cuộc kiểm toán", href: "/settings/engagement" },
  { label: "Phát hiện", href: "/settings/finding" },
] as const;

export type SettingsNavItem = (typeof SETTINGS_NAV_ITEMS)[number];
