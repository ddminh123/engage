"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TeamCard } from "@/features/teams/components/TeamCard";
import { TeamForm } from "@/features/teams/components/TeamForm";
import { TeamMemberSheet } from "@/features/teams/components/TeamMemberSheet";
import { useTeams, useDeleteTeam } from "@/features/teams/hooks/useTeams";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import { Plus, Search } from "lucide-react";
import type { Team } from "@/features/teams/types";

const L = TEAMS_LABELS;

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const { data: teams = [], isLoading } = useTeams(
    search ? { search } : undefined,
  );
  const deleteMutation = useDeleteTeam();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);
  const [managingMembers, setManagingMembers] = useState<Team | null>(null);

  const handleEdit = (team: Team) => {
    setEditing(team);
    setFormOpen(true);
  };

  const handleDelete = (team: Team) => {
    setDeleting(team);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{L.MODULE_TITLE}</h1>
          <p className="mt-1 text-muted-foreground">{L.MODULE_DESCRIPTION}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {L.TEAM_CREATE}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm nhóm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <p className="text-sm">
            {search
              ? "Không tìm thấy nhóm nào."
              : "Chưa có nhóm nào. Tạo nhóm đầu tiên!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageMembers={setManagingMembers}
            />
          ))}
        </div>
      )}

      <TeamForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initialData={editing}
      />

      <TeamMemberSheet
        team={managingMembers}
        open={!!managingMembers}
        onOpenChange={(open) => !open && setManagingMembers(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa nhóm"
        description={
          deleteMutation.error
            ? deleteMutation.error.message
            : L.CONFIRM_DELETE_TEAM
        }
        confirmLabel="Xóa"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
