"use client";
import { Select } from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { setTheme, type Theme } from "@/lib/theme";
import { switchLocalePath } from "@/lib/routes";
import type { Locale } from "@/types/content";
export function Preferences({ locale }: { locale: Locale }) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const fr = locale === "fr";
  return (
    <div className="footer-preferences">
      <Select
        id="footer-language"
        label={fr ? "Langue" : "Language"}
        value={locale}
        options={[
          { value: "fr", label: "Français" },
          { value: "en", label: "English" },
        ]}
        onValueChange={(value) => {
          if (value !== locale) router.push(switchLocalePath(pathname, locale));
        }}
      />
      <Select
        id="footer-theme"
        label={fr ? "Thème" : "Theme"}
        value={theme}
        onValueChange={(value) => setTheme(value as Theme)}
        options={[
          { value: "system", label: fr ? "Système" : "System" },
          { value: "light", label: fr ? "Clair" : "Light" },
          { value: "dark", label: fr ? "Sombre" : "Dark" },
        ]}
      />
    </div>
  );
}
