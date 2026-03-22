"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserSearch } from "@/components/shared/UserSearch";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAddTeamMember, useRemoveTeamMember, useUpdateTeamMember } from "../hooks/useTeams";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import { Crown, UserMinus, ArrowUpCircle, ArrowDownCircle, UserPlus } from "lucide-react";
import type { Team, TeamMember } from "../types";

const L = TEAMS_LABELS;

interface TeamMemberSheetProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamMemberSheet({ team, open, onOpenChange }: TeamMemberSheetProps) {
  const addMutation = useAddTeamMember();
  const removeMutation = useRemoveTeamMember();
  const updateMutation = useUpdateTeamMember();

  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [promoting, setPromoting] = useState<TeamMember | null>(null);
  const [demoting, setDemoting] = useState<TeamMember | null>(null);

  if (!team) return null;

  const memberIds = team.members.map((m) => m.userId);

  const handleAddMember = async (userId: string | null) => {
    if (!userId) return;
    await addMutation.mutateAsync({ teamId: team.id, userId });
  };

  const handleRemoveConfirm = async () => {
    if (!removing) return;
    await removeMutation.mutateAsync({ teamId: team.id, userId: removing.userId });
    setRemoving(null);
  };

  const handlePromoteConfirm = async () => {
    if (!promoting) return;
    await updateMutation.mutateAsync({ teamId: team.id, userId: promoting.userId, action: "promote" });
    setPromoting(null);
  };

  const handleDemoteConfirm = async () => {
    if (!demoting) return;
    await updateMutation.mutateAsync({ teamId: team.id, userId: demoting.userId, action: "demote" });
    setDemoting(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px]">
          <SheetHeader>
            <SheetTitle>{team.name} — {L.TEAM_MEMBERS}</SheetTitle>
            <SheetDescription>
              {team.memberCount} {L.TEAM_MEMBERS.toLowerCase()}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{L.MEMBER_ADD}</p>
              <UserSearch
                value={null}
                onSelect={handleAddMember}
                placeholder="Tìm và thêm thành viên..."
                excludeIds={memberIds}
              />
            </div>

            <div className="space-y-1">
              {team.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar
                      user={{ id: member.userId, name: member.name, avatarUrl: member.avatarUrl }}
                      size="default"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{member.name}</span>
                        {member.teamRole === "owner" && (
                          <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      {member.title && (
                        <p className="text-xs text-muted-foreground truncate">{member.title}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {member.teamRole === "owner" ? L.MEMBER_ROLE_OWNER : L.MEMBER_ROLE_MEMBER}
                    </Badge>
                    {member.teamRole === "member" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={L.MEMBER_PROMOTE}
                        onClick={() => setPromoting(member)}
                      >
                        <ArrowUpCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {member.teamRole === "owner" && team.members.filter((m) => m.teamRole === "owner").length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={L.MEMBER_DEMOTE}
                        onClick={() => setDemoting(member)}
                      >
                        <ArrowDownCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {member.teamRole !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        title={L.MEMBER_REMOVE}
                        onClick={() => setRemoving(member)}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {team.members.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <UserPlus className="h-8 w-8" />
                  <p className="text-sm">Chưa có thành viên nào</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={L.MEMBER_REMOVE}
        description={L.CONFIRM_REMOVE_MEMBER}
        confirmLabel={L.MEMBER_REMOVE}
        onConfirm={handleRemoveConfirm}
        isLoading={removeMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!promoting}
        onOpenChange={(o) => !o && setPromoting(null)}
        title={L.MEMBER_PROMOTE}
        description={L.CONFIRM_PROMOTE}
        confirmLabel={L.MEMBER_PROMOTE}
        onConfirm={handlePromoteConfirm}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!demoting}
        onOpenChange={(o) => !o && setDemoting(null)}
        title={L.MEMBER_DEMOTE}
        description={L.CONFIRM_DEMOTE}
        confirmLabel={L.MEMBER_DEMOTE}
        onConfirm={handleDemoteConfirm}
        isLoading={updateMutation.isPending}
      />
    </>
  );
}
