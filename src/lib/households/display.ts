export function formatHouseholdName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (/household$/i.test(trimmed)) return trimmed;
  return `${trimmed} Household`;
}

export function ageInYears(dateOfBirth: Date | null, today = new Date()) {
  if (!dateOfBirth) return null;
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const month = today.getMonth() - dateOfBirth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  return age < 0 ? null : age;
}

export const HOUSEHOLD_ROLES = [
  { value: "head", label: "Head of household" },
  { value: "parent", label: "Parent or guardian" },
  { value: "child", label: "Child" },
  { value: "member", label: "Member" },
] as const;

export function personInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function personDetailLine(gender: string | null, dateOfBirth: Date | null) {
  const age = ageInYears(dateOfBirth);
  return [gender, age === null ? null : `${age} years`].filter(Boolean).join(" · ");
}

type HouseholdPerson = {
  householdRole: string | null;
  dateOfBirth: Date | null;
  firstName: string;
  lastName: string;
};

export function groupHouseholdPeople<T extends HouseholdPerson>(people: T[]) {
  const parents: T[] = [];
  const children: T[] = [];
  const others: T[] = [];

  for (const person of people) {
    const age = ageInYears(person.dateOfBirth);
    const role = person.householdRole;
    if (role === "child" || (!role && age !== null && age < 18)) {
      children.push(person);
    } else if (
      role === "head" ||
      role === "parent" ||
      (!role && (age === null || age >= 18))
    ) {
      parents.push(person);
    } else {
      others.push(person);
    }
  }

  const byHead = (a: T, b: T) => {
    if (a.householdRole === "head" && b.householdRole !== "head") return -1;
    if (b.householdRole === "head" && a.householdRole !== "head") return 1;
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  };

  parents.sort(byHead);
  children.sort(byHead);
  others.sort(byHead);

  return [
    { title: "Parents and guardians", people: parents },
    { title: "Children", people: children },
    { title: "Members", people: others },
  ].filter((section) => section.people.length > 0);
}
