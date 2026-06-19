import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] dark:bg-stone-950 p-4 relative overflow-hidden">
      {/* Decorative background circle to simulate reading light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/50 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <Card className="border-stone-200 dark:border-stone-800 shadow-xl shadow-amber-900/5 dark:shadow-black/50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center pb-6">
            <CardTitle className="text-3xl font-serif text-stone-800 dark:text-stone-100">Join the Library</CardTitle>
            <CardDescription className="text-stone-500 dark:text-stone-400">
              Create an account to save your reading progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RegisterForm />
            <div className="text-center text-sm text-stone-500 dark:text-stone-400">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
