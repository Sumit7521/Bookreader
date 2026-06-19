import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { auth } from "@/auth";
import { getSettingsAction } from "@/actions/settings";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const settingsRes = await getSettingsAction();
  const initialSettings = settingsRes.success ? settingsRes.settings : null;
  const initialProfilePicture = (settingsRes.success ? settingsRes.profilePicture : session?.user?.image) || null;

  return (
    <SettingsProvider initialSettings={initialSettings} initialProfilePicture={initialProfilePicture}>
      <div className="flex h-[100vh] h-[100dvh] w-[100vw] overflow-hidden bg-stone-50/50 dark:bg-[#0a0a0a]">
        <Sidebar />
        <GlobalSearch />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full relative">
          <Navbar />
          <PageContainer>{children}</PageContainer>
        </div>
      </div>
    </SettingsProvider>
  );
}
