"use client"
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import StateProvider from "@/context/state";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ChatSidebar";
import { usePathname } from 'next/navigation'; // Import the hook to get the current path
import { useContext, useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname(); // Get the current path
  const [isSingleInstance, setIsSingleInstance] = useState(true);
   
  

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
              <SidebarProvider >
                {showSidebar  && <AppSidebar />}
                {showSidebar && <SidebarTrigger onClick={() => { setIsOpen(!isOpen) }} className={` absolute left-0 z-50 top-4 ${!isOpen && ''} `} />}
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
