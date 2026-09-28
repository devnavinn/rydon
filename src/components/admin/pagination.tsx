import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Prev/next links that keep the rest of the query string. */
export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string>;
}) {
  if (pageCount <= 1) return null;
  const hrefFor = (p: number) => `${basePath}?${new URLSearchParams({ ...params, page: String(p) })}`;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(page - 1)}>Previous</Link>
          </Button>
        ) : null}
        {page < pageCount ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(page + 1)}>Next</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
