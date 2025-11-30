import { SidebarNav } from "@/components/layout/SidebarNav";
import { Header } from "@/components/layout/Header";
import { Watermark } from "@/components/layout/Watermark";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="relative flex-1 p-4 md:p-6 lg:p-8">
            <Watermark />
            <div className="w-full h-full">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
