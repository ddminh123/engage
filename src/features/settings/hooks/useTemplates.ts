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
  fetchTemplateBindingsApi,
  upsertTemplateBindingApi,
  deleteTemplateBindingApi,
  fetchTemplateForEntityApi,
} from "../api";
import type {
  Template,
  TemplateInput,
  TemplateCategory,
  TemplateCategoryInput,
  TemplateEntityBinding,
  TemplateEntityBindingInput,
  TemplateForEntity,
} from "../types";

const TEMPLATES_KEY = ["templates"];
const CATEGORIES_KEY = ["template-categories"];
const TEMPLATE_BINDINGS_KEY = ["template-bindings"];

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

// ── Template Entity Bindings ──

export function useTemplateBindings() {
  return useQuery<TemplateEntityBinding[]>({
    queryKey: TEMPLATE_BINDINGS_KEY,
    queryFn: () => fetchTemplateBindingsApi(),
  });
}

export function useUpsertTemplateBinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateEntityBindingInput) => upsertTemplateBindingApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATE_BINDINGS_KEY });
    },
  });
}

export function useDeleteTemplateBinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entityType: string) => deleteTemplateBindingApi(entityType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATE_BINDINGS_KEY });
    },
  });
}

// ── Template for Entity (used by WP editors) ──

export function useTemplateForEntity(entityType: string | null) {
  return useQuery<TemplateForEntity | null>({
    queryKey: ["template-for-entity", entityType],
    queryFn: () => fetchTemplateForEntityApi(entityType!),
    enabled: !!entityType,
  });
}
