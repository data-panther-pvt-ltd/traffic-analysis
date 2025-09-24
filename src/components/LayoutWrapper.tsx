// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";


export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage } = useI18n();

  // Hide Navbar/Footer on login route
  const hideLayout = pathname === "/login";

  return (
    <>
      {!hideLayout && (
        <header className="w-full flex items-center justify-end gap-2 p-3">
          <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-sm font-medium ${language === "en" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-3 py-1.5 text-sm font-medium ${language === "ar" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
            >
              AR
            </button>
          </div>
        </header>
      )}
      <main className="flex-grow">{children}</main>
      {/* {!hideLayout && <ResponsiveFooter />} */}
    </>
  );
}
