"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { TEAMS_LABELS } from "@/constants/labels/teams";
import { Pencil, Trash2, Users, UserPlus } from "lucide-react";
import type { Team } from "../types";

const L = TEAMS_LABELS;

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

export function TeamCard({ team, onEdit, onDelete, onManageMembers }: TeamCardProps) {
  const MAX_AVATARS = 5;
  const visibleMembers = team.members.slice(0, MAX_AVATARS);
  const extraCount = team.members.length - MAX_AVATARS;

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base truncate">{team.name}</CardTitle>
          {team.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(team)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(team)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.owner && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{L.TEAM_OWNER}:</span>
            <span className="font-medium text-foreground truncate">{team.owner.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {visibleMembers.length > 0 ? (
              <AvatarGroup>
                {visibleMembers.map((m) => (
                  <UserAvatar
                    key={m.userId}
                    user={{ id: m.userId, name: m.name, avatarUrl: m.avatarUrl }}
                    size="sm"
                  />
                ))}
                {extraCount > 0 && (
                  <AvatarGroupCount>+{extraCount}</AvatarGroupCount>
                )}
              </AvatarGroup>
            ) : (
              <span className="text-xs text-muted-foreground">Chưa có thành viên</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {team.memberCount} {L.TEAM_MEMBERS.toLowerCase()}
            </Badge>
            <Button variant="ghost" size="icon-sm" onClick={() => onManageMembers(team)}>
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
