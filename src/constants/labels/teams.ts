export const TEAMS_LABELS = {
  // Module
  MODULE_TITLE: 'Nhân sự',
  MODULE_DESCRIPTION: 'Quản lý người dùng, nhóm kiểm toán và phân quyền',

  // User
  USER: 'Người dùng',
  USERS: 'Danh sách người dùng',
  USER_CREATE: 'Thêm người dùng',
  USER_EDIT: 'Chỉnh sửa người dùng',
  USER_DETAIL: 'Chi tiết người dùng',
  USER_NAME: 'Họ tên',
  USER_EMAIL: 'Email',
  USER_PASSWORD: 'Mật khẩu',
  USER_PHONE: 'Số điện thoại',
  USER_TITLE: 'Chức danh',
  USER_ROLE: 'Vai trò',
  USER_SUPERVISOR: 'Người giám sát',
  USER_DESCRIPTION: 'Ghi chú cá nhân',
  USER_STATUS: 'Trạng thái',
  USER_EXPERTISE: 'Chuyên môn',
  USER_TEAMS: 'Nhóm',
  USER_PROVIDER: 'Phương thức đăng nhập',

  // User status
  STATUS_ACTIVE: 'Hoạt động',
  STATUS_LOCKED: 'Đã khóa',
  STATUS_INACTIVE: 'Ngừng hoạt động',

  // User roles (system-level)
  ROLE_CAE: 'Trưởng KTNB',
  ROLE_ADMIN: 'Quản trị viên',
  ROLE_AUDIT_DIRECTOR: 'Giám đốc kiểm toán',
  ROLE_AUDIT_MANAGER: 'Trưởng phòng kiểm toán',
  ROLE_SENIOR_AUDITOR: 'Kiểm toán viên chính',
  ROLE_AUDITOR: 'Kiểm toán viên',

  // User actions
  ACTION_LOCK: 'Khóa tài khoản',
  ACTION_UNLOCK: 'Mở khóa tài khoản',
  ACTION_DEACTIVATE: 'Vô hiệu hóa',

  // Team
  TEAM: 'Nhóm',
  TEAMS: 'Danh sách nhóm',
  TEAM_CREATE: 'Thêm nhóm',
  TEAM_EDIT: 'Chỉnh sửa nhóm',
  TEAM_DETAIL: 'Chi tiết nhóm',
  TEAM_NAME: 'Tên nhóm',
  TEAM_DESCRIPTION: 'Mô tả',
  TEAM_OWNER: 'Trưởng nhóm',
  TEAM_STATUS: 'Trạng thái',
  TEAM_MEMBERS: 'Thành viên',
  TEAM_MEMBER_COUNT: 'Số thành viên',

  // Team member actions
  MEMBER_ADD: 'Thêm thành viên',
  MEMBER_REMOVE: 'Xóa thành viên',
  MEMBER_PROMOTE: 'Đề bạt trưởng nhóm',
  MEMBER_DEMOTE: 'Hạ cấp thành viên',
  MEMBER_MOVE: 'Chuyển nhóm',
  MEMBER_ROLE_OWNER: 'Trưởng nhóm',
  MEMBER_ROLE_MEMBER: 'Thành viên',

  // Expertise
  EXPERTISE: 'Chuyên môn',
  EXPERTISES: 'Danh sách chuyên môn',
  EXPERTISE_CREATE: 'Thêm chuyên môn',
  EXPERTISE_EDIT: 'Chỉnh sửa chuyên môn',
  EXPERTISE_LABEL: 'Tên',
  EXPERTISE_CODE: 'Mã',
  EXPERTISE_DESCRIPTION: 'Mô tả',

  // Validation
  VALIDATION_NAME_REQUIRED: 'Vui lòng nhập họ tên',
  VALIDATION_EMAIL_REQUIRED: 'Vui lòng nhập email',
  VALIDATION_EMAIL_INVALID: 'Email không hợp lệ',
  VALIDATION_PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu',
  VALIDATION_PASSWORD_MIN: 'Mật khẩu tối thiểu 6 ký tự',
  VALIDATION_ROLE_REQUIRED: 'Vui lòng chọn vai trò',
  VALIDATION_TEAM_NAME_REQUIRED: 'Vui lòng nhập tên nhóm',
  VALIDATION_OWNER_REQUIRED: 'Vui lòng chọn trưởng nhóm',

  // Confirm
  CONFIRM_LOCK: 'Bạn có chắc muốn khóa tài khoản này?',
  CONFIRM_UNLOCK: 'Bạn có chắc muốn mở khóa tài khoản này?',
  CONFIRM_DEACTIVATE: 'Bạn có chắc muốn vô hiệu hóa tài khoản này?',
  CONFIRM_DELETE_TEAM: 'Bạn có chắc muốn xóa nhóm này?',
  CONFIRM_REMOVE_MEMBER: 'Bạn có chắc muốn xóa thành viên này khỏi nhóm?',
  CONFIRM_PROMOTE: 'Đề bạt thành viên này làm trưởng nhóm? Trưởng nhóm hiện tại sẽ trở thành thành viên.',
  CONFIRM_DEMOTE: 'Hạ cấp trưởng nhóm này thành thành viên?',
} as const;

export const USER_ROLE_OPTIONS = [
  { value: 'cae', label: TEAMS_LABELS.ROLE_CAE },
  { value: 'admin', label: TEAMS_LABELS.ROLE_ADMIN },
  { value: 'audit_director', label: TEAMS_LABELS.ROLE_AUDIT_DIRECTOR },
  { value: 'audit_manager', label: TEAMS_LABELS.ROLE_AUDIT_MANAGER },
  { value: 'senior_auditor', label: TEAMS_LABELS.ROLE_SENIOR_AUDITOR },
  { value: 'auditor', label: TEAMS_LABELS.ROLE_AUDITOR },
] as const;

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: TEAMS_LABELS.STATUS_ACTIVE },
  { value: 'locked', label: TEAMS_LABELS.STATUS_LOCKED },
  { value: 'inactive', label: TEAMS_LABELS.STATUS_INACTIVE },
] as const;

export function getRoleLabel(role: string): string {
  const opt = USER_ROLE_OPTIONS.find((o) => o.value === role);
  return opt?.label || role;
}

export function getStatusLabel(status: string): string {
  const opt = USER_STATUS_OPTIONS.find((o) => o.value === status);
  return opt?.label || status;
}
