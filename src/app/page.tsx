import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to BookReader
        </h1>
        <p className="text-lg text-muted-foreground">
          Your platform for reading and writing amazing stories.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link href="/login" className={buttonVariants({ variant: "default" })}>Get Started</Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Go to Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
