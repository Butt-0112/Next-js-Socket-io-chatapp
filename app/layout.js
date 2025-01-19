"use client"
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import StateProvider from "@/context/state";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ChatSidebar";
import { usePathname } from 'next/navigation'; // Import the hook to get the current path

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});



export default function RootLayout({ children }) {
  const pathname = usePathname(); // Get the current path

  // List of routes where the sidebar should be hidden
  const noSidebarRoutes = ['/login', '/signup'];

  const showSidebar = !noSidebarRoutes.includes(pathname);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-hidden">
        <StateProvider>

      <ThemeProvider
       attribute="class"
       defaultTheme="system"
       enableSystem
       disableTransitionOnChange
       >
         <SidebarProvider>
          {showSidebar&&<AppSidebar/>}
          {showSidebar&& <SidebarTrigger className="absolute right-0" />}
          <main className="w-full"> 

        {children}
          </main>
        </SidebarProvider>
      </ThemeProvider>
        </StateProvider>
      </body>
    </html>
  );
}
