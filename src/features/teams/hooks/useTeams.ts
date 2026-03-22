import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import type { CreateTeamInput, UpdateTeamInput } from '../types';

const TEAMS_KEY = ['teams'];

export function useTeams(filters?: {
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [...TEAMS_KEY, filters],
    queryFn: () => api.fetchTeams(filters),
  });
}

export function useTeam(id: string | null) {
  return useQuery({
    queryKey: [...TEAMS_KEY, id],
    queryFn: () => api.fetchTeamById(id!),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamInput) => api.createTeam(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) =>
      api.updateTeam(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId, role, fromTeamId }: {
      teamId: string;
      userId: string;
      role?: string;
      fromTeamId?: string;
    }) => api.addTeamMember(teamId, userId, role, fromTeamId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId, action }: {
      teamId: string;
      userId: string;
      action: 'promote' | 'demote';
    }) => api.updateTeamMember(teamId, userId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      api.removeTeamMember(teamId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TEAMS_KEY }),
  });
}
