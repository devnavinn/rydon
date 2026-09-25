import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Rydo helps motorcyclists find local riders, plan group rides, and stay connected on the road.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">About Rydo</h1>
      <p className="text-muted-foreground">
        Rydo is built for motorcyclists who ride better together. We help you find local riders,
        plan group rides, and stay connected on the road — because every rider deserves a
        brotherhood.
      </p>
    </div>
  );
}
