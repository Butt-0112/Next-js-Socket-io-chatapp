"use client"
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import StateProvider from "@/context/state";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ChatSidebar";
import { usePathname } from 'next/navigation'; // Import the hook to get the current path
import { useContext, useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
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
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname(); // Get the current path
  const [isSingleInstance, setIsSingleInstance] = useState(true);

  useEffect(() => {
    const instanceKey = 'app-instance';
    const instanceId = Date.now().toString();

    // Check if another instance is already running
    if (localStorage.getItem(instanceKey)) {
      setIsSingleInstance(false);
      window.close(); // Close the current tab if another instance is running
    } else {
      // Set the flag in localStorage
      localStorage.setItem(instanceKey, instanceId);

      // Clear the flag when the window is closed or unloaded
      const clearInstance = () => {
        if (localStorage.getItem(instanceKey) === instanceId) {
          localStorage.removeItem(instanceKey);
        }
      };

      window.addEventListener('beforeunload', clearInstance);

      // Listen for storage events to detect changes from other tabs or windows
      const handleStorageChange = (event) => {
        if (event.key === instanceKey && event.newValue !== instanceId) {
          window.close(); // Close the current tab if another instance is opened
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('beforeunload', clearInstance);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // List of routes where the sidebar should be hidden 
  const noSidebarRoutes = ['/login', '/signup', '/dashboard'];

  const showSidebar = !noSidebarRoutes.some(route => pathname.startsWith(route));

  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }} >

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
                {showSidebar  && <AppSidebar />}
                {showSidebar && <SidebarTrigger onClick={() => { setIsOpen(!isOpen) }} className={` absolute left-0 z-50 top-3 ${!isOpen && ''} `} />}
                <main className="w-full">



                  {
                    // !isSingleInstance ? <div className="text-center">Another instance of the application is already running.</div>
                      // : 
                      children
                  }
                </main>
              </SidebarProvider>
            </ThemeProvider>
          </StateProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
