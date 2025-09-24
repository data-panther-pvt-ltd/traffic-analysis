import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const LogoutButton = () => {
  const router = useRouter();
  const { t } = useI18n();

  const handleLogout = () => {
    router.push("/logout");
  };

  return (
    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
      {t('logout')}
    </button>
  );
};

export default LogoutButton;
