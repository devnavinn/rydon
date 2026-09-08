"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signInAction, type ActionState } from "@/features/auth/server/actions";
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

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <Card className="border-white/10 shadow-2xl shadow-black/40">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-wide">Welcome back</CardTitle>
        <CardDescription>Sign in to find your crew.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identifier">Username or email</Label>
            <Input id="identifier" name="identifier" autoComplete="username" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to Rydo?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
