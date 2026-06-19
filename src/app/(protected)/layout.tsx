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
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <GlobalSearch />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
          <Navbar />
          <PageContainer>{children}</PageContainer>
        </div>
      </div>
    </SettingsProvider>
  );
}
