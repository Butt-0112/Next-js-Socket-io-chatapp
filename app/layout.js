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

          <StateProvider>
      <html lang="en" suppressHydrationWarning>

        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content" />
          {/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /> */}

          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="LiveChat" />
        </head>
        <body className="antialiased">

            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider >
                {showSidebar && <AppSidebar />}
                {children}
              </SidebarProvider>
            </ThemeProvider>
        </body>
      </html>
          </StateProvider>
    </ClerkProvider>
  );
}
