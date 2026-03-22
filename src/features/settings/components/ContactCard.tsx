"use client";

import * as React from "react";
import { Mail, Phone, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SETTINGS_LABELS } from "@/constants/labels";
import { useContact } from "../hooks/useContacts";
import type { Contact } from "../types";

const LC = SETTINGS_LABELS.contact;

// =============================================================================
// Card content (standalone — used inside the popover)
// =============================================================================

interface ContactCardContentProps {
  contact: Contact;
}

function ContactCardContent({ contact }: ContactCardContentProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <div className="font-semibold text-sm">{contact.name}</div>
        {contact.position && (
          <div className="text-xs text-muted-foreground">
            {contact.position}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-1.5 text-xs">
        {contact.email && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.unitName && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span>{contact.unitName}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <Badge
        variant={contact.status === "active" ? "default" : "secondary"}
        className="text-xs"
      >
        {contact.status === "active" ? LC.status.active : LC.status.inactive}
      </Badge>
    </div>
  );
}

// =============================================================================
// Popover wrapper — trigger is the children node
// =============================================================================

interface ContactCardPopoverProps {
  contact: Contact;
  children: React.ReactNode;
}

export function ContactCardPopover({
  contact,
  children,
}: ContactCardPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="cursor-pointer hover:underline focus:outline-none focus-visible:underline"
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 p-3">
        <ContactCardContent contact={contact} />
      </PopoverContent>
    </Popover>
  );
}

// =============================================================================
// Popover wrapper (by ID) — fetches contact lazily on open
// =============================================================================

interface ContactCardPopoverByIdProps {
  id: string;
  children: React.ReactNode;
}

function ContactCardContentById({ id }: { id: string }) {
  const { data: contact, isLoading } = useContact(id);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    );
  }

  if (!contact) return null;
  return <ContactCardContent contact={contact} />;
}

export function ContactCardPopoverById({
  id,
  children,
}: ContactCardPopoverByIdProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="cursor-pointer hover:underline focus:outline-none focus-visible:underline"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 p-3">
        {open && <ContactCardContentById id={id} />}
      </PopoverContent>
    </Popover>
  );
}
