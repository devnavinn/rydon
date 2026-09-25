"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signUpAction, type ActionState } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: ActionState = { error: null };

export function SignUpForm({
  nextPath,
  google,
}: {
  nextPath: string;
  /** "Continue with Google" — rendered by the server page only when configured. */
  google: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <Card className="border-white/10 shadow-2xl shadow-black/40">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-wide">Join the brotherhood</CardTitle>
        <CardDescription>Create your rider account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {google}
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextPath} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" autoComplete="username" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already riding with us?{" "}
          <Link href={nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in"} className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
