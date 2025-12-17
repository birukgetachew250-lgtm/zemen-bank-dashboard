
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
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 relative flex flex-col flex-grow">
            <Watermark />
            <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
            <footer className="relative z-10 text-center text-xs text-muted-foreground py-4 mt-auto">
              © {new Date().getFullYear()} Zemen Bank. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
