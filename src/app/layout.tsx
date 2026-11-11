
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "Zemen Admin Center",
  description: "Zemen Bank Super App Management Dashboard",
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function handleChunkError(e) {
                  var msg = (e && (e.message || (e.reason && e.reason.message))) || '';
                  var target = e && e.target;
                  var isScriptChunk = target && target.tagName === 'SCRIPT' && target.src && target.src.indexOf('/_next/static/chunks/') !== -1;
                  if (isScriptChunk || /Loading chunk [\\d\\w-]+ failed|ChunkLoadError/i.test(msg)) {
                    var key = 'zemen:chunk-reload';
                    var last = Number(sessionStorage.getItem(key) || 0);
                    if (Date.now() - last > 10000) {
                      sessionStorage.setItem(key, String(Date.now()));
                      window.location.reload();
                    }
                  }
                }
                window.addEventListener('error', handleChunkError, true);
                window.addEventListener('unhandledrejection', handleChunkError);
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
