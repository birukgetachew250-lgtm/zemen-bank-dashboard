import { Watermark } from "@/components/layout/Watermark";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Watermark />
      <div className="w-full max-w-md z-10">{children}</div>
    </main>
  );
}
