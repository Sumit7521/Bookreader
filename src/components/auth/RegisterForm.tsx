"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          name="name" 
          type="text" 
          required 
          placeholder="Jane Austen" 
          className="bg-background/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="jane@example.com" 
          className="bg-background/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          className="bg-background/50"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing library card..." : "Get Library Card (Register)"}
      </Button>
    </form>
  );
}
