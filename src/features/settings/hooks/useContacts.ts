import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  fetchContactById,
  searchContacts,
  createContactApi,
  updateContactApi,
  deleteContactApi,
} from '../api';
import type { ContactInput } from '../types';

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: () => [...contactKeys.lists()] as const,
  searches: () => [...contactKeys.all, 'search'] as const,
  search: (query: string) => [...contactKeys.searches(), query] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

export function useContacts(search?: string) {
  return useQuery({
    queryKey: [...contactKeys.list(), search ?? ''],
    queryFn: () => fetchContacts(search || undefined),
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: contactKeys.detail(id!),
    queryFn: () => fetchContactById(id!),
    enabled: !!id,
  });
}

export function useContactSearch(query: string) {
  return useQuery({
    queryKey: contactKeys.search(query),
    queryFn: () => searchContacts(query),
    staleTime: 30_000,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContactInput) => createContactApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactInput }) =>
      updateContactApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContactApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}
