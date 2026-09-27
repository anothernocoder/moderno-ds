import { Alert, Avatar, Button, Indicator, Skeleton } from "@moderno-ui/react";

export interface PortfolioLink {
  id: string;
  label: string;
  href: string;
}

const sampleLinks: PortfolioLink[] = [
  { id: "email", label: "Email", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "dribbble", label: "Dribbble", href: "#" },
  { id: "cv", label: "CV", href: "#" },
];

export interface PortfolioHeaderProps {
  name?: string;
  role?: string;
  bio?: string;
  initials?: string;
  avatarUrl?: string;
  availability?: string;
  links?: PortfolioLink[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function PortfolioHeader({
  name = "Lena Ortiz",
  role = "Product designer in Lisbon",
  bio = "I design calm, useful software for small teams, from the first sketch to the shipped product. Ten years in, I still love the details.",
  initials = "LO",
  avatarUrl,
  availability = "Available for new projects",
  links = sampleLinks,
  error,
  loading = false,
  disabled = false,
  onRetry,
}: PortfolioHeaderProps) {
  const hasAvatar = Boolean(initials || avatarUrl);

  return (
    <section className="@container moderno-block-portfolio-header text-foreground">
      <div className="px-4 py-12 @lg:py-20">
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
            className="mx-auto flex max-w-lg flex-col gap-6 @md:flex-row @md:gap-8"
          >
            <span className="sr-only">Loading the profile…</span>
            <Skeleton aria-hidden="true" shape="circle" className="w-12 self-start" />
            <div aria-hidden="true" className="grid flex-1 gap-6 @lg:gap-8">
              <Skeleton shape="text" className="w-48" />
              <div className="grid gap-3">
                <Skeleton shape="text" className="h-8 w-2/3 @md:h-10" />
                <Skeleton shape="text" className="w-1/2" />
                <Skeleton shape="text" className="w-full" />
                <Skeleton shape="text" className="w-3/4" />
              </div>
              <div className="flex gap-6">
                <Skeleton shape="text" className="w-12" />
                <Skeleton shape="text" className="w-16" />
                <Skeleton shape="text" className="w-16" />
              </div>
            </div>
          </div>
        ) : (
          <header className="mx-auto flex w-fit max-w-lg flex-col gap-6 @md:flex-row @md:gap-8">
            {hasAvatar ? (
              <Avatar.Root size="lg">
                <Avatar.Fallback>{initials}</Avatar.Fallback>
                {avatarUrl ? <Avatar.Image src={avatarUrl} alt="" /> : null}
              </Avatar.Root>
            ) : null}

            <div className="grid min-w-0 flex-1 gap-6 @lg:gap-8">
              {availability ? (
                <Indicator variant="success" className="justify-self-start">
                  {availability}
                </Indicator>
              ) : null}

              <div className="grid gap-3">
                <h1 className="font-serif text-heading text-balance @md:text-heading-lg">{name}</h1>
                {role ? <p className="text-body font-medium @sm:text-body-lg">{role}</p> : null}
                {bio ? (
                  <p className="text-body text-pretty text-muted-foreground @sm:text-body-lg">
                    {bio}
                  </p>
                ) : null}
              </div>

              {links.length > 0 ? (
                <nav aria-label="Links">
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {links.map((link) => (
                      <li key={link.id}>
                        <a
                          className="rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                          href={disabled ? undefined : link.href}
                          role={disabled ? "link" : undefined}
                          aria-disabled={disabled || undefined}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </header>
        )}
      </div>
    </section>
  );
}
