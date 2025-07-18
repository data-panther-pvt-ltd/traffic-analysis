// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";


export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide Navbar/Footer on login route
  const hideLayout = pathname === "/login";

  return (
    <>
      {/* {!hideLayout && <ModernNavbar />} */}
      <main className="flex-grow">{children}</main>
      {/* {!hideLayout && <ResponsiveFooter />} */}
    </>
  );
}
