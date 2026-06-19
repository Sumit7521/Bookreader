import React from "react";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col w-full min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
      <div className="mx-auto max-w-7xl flex-1 w-full flex flex-col">
        {children}
      </div>
    </main>
  );
}
