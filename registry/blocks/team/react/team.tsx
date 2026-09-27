import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  avatarUrl?: string;
  href?: string;
}

const sampleMembers: TeamMember[] = [
  {
    id: "nora",
    name: "Nora Castillo",
    role: "Co-founder, CEO",
    bio: "Spent ten years closing the books for agencies, then set out to make it take an afternoon.",
    initials: "NC",
    href: "#",
  },
  {
    id: "jonas",
    name: "Jonas Berg",
    role: "Co-founder, CTO",
    bio: "Builds the sync that keeps every bank feed in step. Happiest when the tests pass first time.",
    initials: "JB",
    href: "#",
  },
  {
    id: "priya",
    name: "Priya Raman",
    role: "Head of Design",
    bio: "Turns spreadsheets into screens that people enjoy opening on a Monday morning.",
    initials: "PR",
    href: "#",
  },
  {
    id: "kwame",
    name: "Kwame Mensah",
    role: "Engineer, Payments",
    bio: "Works on invoices and payouts. Nothing pleases him more than a match to the cent.",
    initials: "KM",
    href: "#",
  },
  {
    id: "elif",
    name: "Elif Demir",
    role: "Customer Success",
    bio: "Answers most of your emails, usually within the hour and often with a screenshot.",
    initials: "ED",
    href: "#",
  },
  {
    id: "luca",
    name: "Luca Moretti",
    role: "Accountant in residence",
    bio: "Reads every report the way your accountant will, before it reaches you.",
    initials: "LM",
  },
];

const placeholders = ["first", "second", "third"];

export interface TeamProps {
  heading?: string;
  description?: string;
  members?: TeamMember[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function Team({
  heading = "Meet the team",
  description = "A small crew of designers, engineers and accountants who build it and answer your emails.",
  members = sampleMembers,
  error,
  loading = false,
  disabled = false,
  onRetry,
}: TeamProps) {
  return (
    <section className="@container moderno-block-team text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-md">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The rest of the page still works. Try again in a moment.
              </Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : loading ? (
          <div
            role="status"
            aria-busy="true"
            className="grid gap-x-6 gap-y-10 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-x-8 @lg:gap-y-12"
          >
            <span className="sr-only">Loading the team…</span>
            {placeholders.map((key) => (
              <div key={key} aria-hidden="true" className="flex flex-col gap-4 @sm:flex-row">
                <Skeleton shape="circle" className="w-12 self-start" />
                <div className="grid flex-1 gap-2">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="mx-auto w-full max-w-md rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No team members to show yet.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-10 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-x-8 @lg:gap-y-12">
            {members.map((member) => (
              <li key={member.id} className="flex flex-col gap-4 @sm:flex-row">
                <Avatar.Root size="lg">
                  <Avatar.Fallback>{member.initials}</Avatar.Fallback>
                  {member.avatarUrl ? <Avatar.Image src={member.avatarUrl} alt="" /> : null}
                </Avatar.Root>
                <div className="grid min-w-0 gap-1">
                  <h3 className="text-ui-md font-semibold">
                    {member.href ? (
                      <a
                        className="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                        href={disabled ? undefined : member.href}
                        role={disabled ? "link" : undefined}
                        aria-disabled={disabled || undefined}
                      >
                        {member.name}
                      </a>
                    ) : (
                      member.name
                    )}
                  </h3>
                  <p className="text-ui-sm text-muted-foreground">{member.role}</p>
                  <p className="mt-2 text-ui-md text-pretty text-muted-foreground">{member.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
