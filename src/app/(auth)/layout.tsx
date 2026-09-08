import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-garage-glow bg-grain relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-garage-stripes opacity-50" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="size-6">
              <path
                d="M4 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M13 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7.5 17.5 10 9h3l1.2 2.4M10 9 8.5 6h-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 9h3.5l1 2.4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-heading text-3xl tracking-wide">RYDO</span>
          <p className="text-sm text-muted-foreground">Find your riding brotherhood.</p>
        </Link>
        {children}
      </div>
    </div>
  );
}
