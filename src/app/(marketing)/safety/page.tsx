const TIPS = [
  "Always wear a certified helmet and protective riding gear.",
  "Share your ride and live location with an emergency contact before you leave.",
  "Ride within your skill level and follow the group's lead/sweep pace.",
  "Do a pre-ride check: tires, brakes, lights, and fuel.",
  "Keep a safe following distance, especially in group formation.",
];

export default function SafetyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold">Ride safe</h1>
      <p className="text-muted-foreground">
        Rydo helps you find riding partners, but every rider is responsible for their own safety.
        A few reminders before you roll out:
      </p>
      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
