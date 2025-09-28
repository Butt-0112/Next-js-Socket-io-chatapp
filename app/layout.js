import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import StateProvider from "@/context/state";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ChatSidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content', // Chrome Android keyboard overlay
};
export default function RootLayout({ children }) {


  // List of routes where the sidebar should be hidden 
  const noSidebarRoutes = ['/login', '/signup', '/dashboard'];

  // const showSidebar = !noSidebarRoutes.some(route => window?location?.pathname.startsWith(route))

  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }} >

      <StateProvider>
        <html lang="en" suppressHydrationWarning>

          <head>
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="LiveChat" />
            {/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content" /> */}
          </head>
          <body className="antialiased">

            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider >
                {/* {showSidebar && <AppSidebar />} */}
                <AppSidebar />
                <main className="w-full max-h-100dvh overflow-hidden">

                  {children}
                </main>
              </SidebarProvider>
            </ThemeProvider>
          </body>
        </html>
      </StateProvider>
    </ClerkProvider>
  );
}
