import type { ReactNode } from "react";
import Link from "next/link";
import { groupHouseholdPeople, personDetailLine, personInitials } from "@/lib/households/display";

type RosterPerson = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: Date | null;
  householdRole: string | null;
  member: { id: string } | null;
};

export function HouseholdRoster({
  people,
  currentPersonId,
  trailing,
}: {
  people: RosterPerson[];
  currentPersonId?: string;
  trailing?: (person: RosterPerson) => ReactNode;
}) {
  const sections = groupHouseholdPeople(people);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No one is attached yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{section.title}</p>
          <ul className="space-y-2">
            {section.people.map((person) => {
              const detail = personDetailLine(person.gender, person.dateOfBirth);
              const name = `${person.firstName} ${person.lastName}`;
              const current = person.id === currentPersonId;
              return (
                <li key={person.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {personInitials(person.firstName, person.lastName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {person.member ? (
                      <Link
                        href={`/admin/members/${person.member.id}`}
                        className={`block truncate text-sm text-foreground underline-offset-4 hover:underline ${current ? "font-semibold" : "font-medium"}`}
                      >
                        {name}
                        {person.householdRole === "head" ? " ★" : ""}
                      </Link>
                    ) : (
                      <p className={`truncate text-sm text-foreground ${current ? "font-semibold" : "font-medium"}`}>
                        {name}
                        {person.householdRole === "head" ? " ★" : ""}
                      </p>
                    )}
                    {detail ? (
                      <p className="text-xs text-muted-foreground">{detail}</p>
                    ) : null}
                  </div>
                  {trailing ? trailing(person) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
