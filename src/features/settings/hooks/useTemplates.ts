"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTemplates,
  fetchTemplateById,
  createTemplateApi,
  updateTemplateApi,
  deleteTemplateApi,
  fetchTemplateCategories,
  createTemplateCategoryApi,
} from "../api";
import type { Template, TemplateInput, TemplateCategory, TemplateCategoryInput } from "../types";

const TEMPLATES_KEY = ["templates"];
const CATEGORIES_KEY = ["template-categories"];

// ── Categories ──

export function useTemplateCategories() {
  return useQuery<TemplateCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: () => fetchTemplateCategories(),
  });
}

export function useCreateTemplateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateCategoryInput) => createTemplateCategoryApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

// ── Templates ──

export function useTemplates(filters?: {
  entityType?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  return useQuery<Template[]>({
    queryKey: [...TEMPLATES_KEY, filters],
    queryFn: () => fetchTemplates(filters),
  });
}

export function useTemplate(id: string | null) {
  return useQuery<Template>({
    queryKey: [...TEMPLATES_KEY, id],
    queryFn: () => fetchTemplateById(id!),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateInput) => createTemplateApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TemplateInput> }) =>
      updateTemplateApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplateApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}
