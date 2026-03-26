import { SystemSettingsForm } from "@/features/settings/components/SystemSettingsForm";

export default function SystemSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Hệ thống</h1>
      <p className="mt-2 text-muted-foreground mb-6">
        Cấu hình chung của hệ thống.
      </p>
      <SystemSettingsForm />
    </div>
  );
}
