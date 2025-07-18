"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear the cookie
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    // Optional delay for UX
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800">Logging you out...</h1>
        <p className="text-gray-500">Redirecting to login page.</p>
      </div>
    </div>
  );
};

export default LogoutPage;
