
import { Header } from "@/components/layout/Header";
import { Watermark } from "@/components/layout/Watermark";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex h-full flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative flex flex-col">
          <Watermark />
          <div className="flex-1 w-full flex flex-col">
            {children}
          </div>
          <footer className="relative z-10 text-center text-xs text-muted-foreground pt-4 mt-auto">
            © {new Date().getFullYear()} Zemen Bank. All rights reserved.
          </footer>
        </main>
      </div>
  );
}
