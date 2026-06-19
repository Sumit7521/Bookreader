import React from "react";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      {children}
    </main>
  );
}
