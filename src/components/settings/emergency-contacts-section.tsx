import type { EmergencyContact } from "@prisma/client";

import {
  deleteEmergencyContactAction,
  setPrimaryEmergencyContactAction,
} from "@/features/profile/server/actions";
import { MAX_EMERGENCY_CONTACTS } from "@/features/profile/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddEmergencyContactForm } from "@/components/settings/add-emergency-contact-form";

export function EmergencyContactsSection({ contacts }: { contacts: EmergencyContact[] }) {
  return (
    <div className="flex flex-col gap-4">
      {contacts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{contact.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[contact.phone, contact.relation].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {contact.isPrimary ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : (
                  <form action={setPrimaryEmergencyContactAction.bind(null, contact.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Set primary
                    </Button>
                  </form>
                )}
                <form action={deleteEmergencyContactAction.bind(null, contact.id)}>
                  <Button
                    type="submit"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remove contact"
                  >
                    ×
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No emergency contacts yet — add someone who should be notified if a ride goes wrong.
        </p>
      )}

      <AddEmergencyContactForm atLimit={contacts.length >= MAX_EMERGENCY_CONTACTS} />
    </div>
  );
}
