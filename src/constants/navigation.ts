export const NAV_ITEMS = [
  { label: "Tổng quan", href: "/" },
  { label: "Phạm vi tổng thể", href: "/universe" },
  { label: "Kế hoạch", href: "/plan" },
  { label: "Cuộc kiểm toán", href: "/engagement" },
  { label: "Phát hiện", href: "/finding" },
  { label: "Nhân sự", href: "/teams" },
  { label: "Cài đặt", href: "/settings" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
