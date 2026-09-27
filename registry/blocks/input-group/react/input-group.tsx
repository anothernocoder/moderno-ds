import type { FormEvent } from "react";
import { Button, Field, Spinner } from "@moderno-ui/react";

export type InputGroupField = "website" | "price" | "query";

export interface InputGroupProps {
  website?: string;
  price?: string;
  apiKey?: string;
  query?: string;
  errors?: Partial<Record<InputGroupField, string>>;
  loading?: boolean;
  disabled?: boolean;
  onCopy?: (apiKey: string) => void;
  onSearch?: (query: string) => void;
}

export function InputGroup({
  website = "acme.shop",
  price = "49.00",
  apiKey = "mdn_pub_5c1e8a93d0b74f2a",
  query = "",
  errors,
  loading = false,
  disabled = false,
  onCopy,
  onSearch,
}: InputGroupProps) {
  const inert = loading || disabled;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(String(new FormData(event.currentTarget).get("query") ?? ""));
  }

  return (
    <section className="@container moderno-block-input-group text-foreground">
      <div className="grid gap-6 @sm:gap-8 @lg:grid-cols-3">
        <header className="grid content-start gap-1">
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">Storefront</h2>
          <p className="text-ui-md text-muted-foreground">
            Where customers find your shop, what they pay, and how your apps connect.
          </p>
        </header>

        <div className="grid gap-5 @sm:gap-6 @md:grid-cols-2 @lg:col-span-2">
          <Field.Root invalid={Boolean(errors?.website)} disabled={inert}>
            <Field.Label>Store address</Field.Label>
            <div className="flex">
              <span className="flex shrink-0 items-center rounded-s-lg border border-e-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">
                https://
              </span>
              <Field.Input
                name="website"
                inputMode="url"
                autoComplete="url"
                placeholder="your-shop.com"
                defaultValue={website}
                className="min-w-0 flex-1 rounded-s-none"
              />
            </div>
            <Field.HelperText>Your own domain, or the one we gave you.</Field.HelperText>
            <Field.ErrorText>{errors?.website}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={Boolean(errors?.price)} disabled={inert}>
            <Field.Label>Price</Field.Label>
            <div className="flex">
              <span className="flex shrink-0 items-center rounded-s-lg border border-e-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">
                $
              </span>
              <Field.Input
                name="price"
                inputMode="decimal"
                placeholder="0.00"
                defaultValue={price}
                className="min-w-0 flex-1 rounded-none"
              />
              <span className="flex shrink-0 items-center rounded-e-lg border border-s-0 border-input bg-muted px-3 text-ui-md text-muted-foreground in-data-invalid:border-destructive">
                USD
              </span>
            </div>
            <Field.HelperText>Before tax.</Field.HelperText>
            <Field.ErrorText>{errors?.price}</Field.ErrorText>
          </Field.Root>

          <Field.Root readOnly disabled={inert}>
            <Field.Label>API key</Field.Label>
            <div className="flex">
              <Field.Input
                name="apiKey"
                placeholder="No key yet"
                value={apiKey}
                className="min-w-0 flex-1 rounded-e-none font-mono"
              />
              <Button
                type="button"
                variant="outline"
                aria-label="Copy API key"
                className="shrink-0 rounded-s-none border-s-0"
                disabled={inert || !apiKey}
                onClick={() => onCopy?.(apiKey)}
              >
                Copy
              </Button>
            </div>
            <Field.HelperText>Anyone with this key can read your catalogue.</Field.HelperText>
          </Field.Root>

          <form role="search" className="grid" onSubmit={handleSearch} noValidate>
            <Field.Root invalid={Boolean(errors?.query)} disabled={inert}>
              <Field.Label>Find a product</Field.Label>
              <div className="flex">
                <Field.Input
                  name="query"
                  type="search"
                  placeholder="Name or SKU"
                  defaultValue={query}
                  className="min-w-0 flex-1 rounded-e-none"
                />
                <Button
                  type="submit"
                  className="shrink-0 rounded-s-none border-s-0"
                  disabled={inert}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" aria-hidden="true" />
                      Searching
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              <Field.ErrorText>{errors?.query}</Field.ErrorText>
            </Field.Root>
          </form>
        </div>
      </div>
    </section>
  );
}
