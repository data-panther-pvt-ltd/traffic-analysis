import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/logout");
  };

  return (
    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
      Logout
    </button>
  );
};

export default LogoutButton;
