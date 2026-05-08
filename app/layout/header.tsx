import {
  Check,
  CircleQuestionMark,
  CircleUser,
  Globe,
  Lock,
  Monitor,
  Moon,
  Server,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, unstable_useRoute as useRoute, useLocation, useSubmit } from "react-router";

import LanguageSwitcher from "~/components/language-switcher";
import Link from "~/components/link";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import corsecureLogo from "~/logo/corsecure.png";
import cn from "~/utils/cn";
import type { ColorScheme } from "~/utils/color-scheme";

export interface HeaderProps {
  user: {
    subject: string;
    name: string;
    email?: string;
    username?: string;
    picture?: string;
  };
  access: {
    ui: boolean;
    machines: boolean;
    dns: boolean;
    users: boolean;
    policy: boolean;
    settings: boolean;
  };
  configAvailable: boolean;
}

const tabs = [
  { to: "/machines", icon: Server, labelKey: "nav.machines", key: "machines" },
  { to: "/users", icon: Users, labelKey: "nav.users", key: "users" },
  { to: "/acls", icon: Lock, labelKey: "nav.acls", key: "policy" },
  { to: "/dns", icon: Globe, labelKey: "nav.dns", key: "dns" },
  { to: "/settings", icon: Settings, labelKey: "nav.settings", key: "settings" },
] as const;

const colorSchemes = [
  { value: "system", labelKey: "header.colorSystem", icon: Monitor },
  { value: "light", labelKey: "header.colorLight", icon: Sun },
  { value: "dark", labelKey: "header.colorDark", icon: Moon },
] as const satisfies ReadonlyArray<{
  value: ColorScheme;
  labelKey: string;
  icon: typeof Monitor;
}>;

export default function Header({ user, access, configAvailable }: HeaderProps) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const showTabs = access.ui;
  const rootRoute = useRoute("root");
  const currentColorScheme: ColorScheme = rootRoute?.loaderData?.colorScheme ?? "system";
  // useLocation returns the path with the basename already stripped, which is
  // what `redirect()` expects — react-router re-applies the basename when
  // following the redirect on the client.
  const location = useLocation();
  const returnTo = location.pathname + location.search;

  return (
    <header
      className={cn(
        "bg-mist-200 dark:bg-mist-950 text-mist-800 dark:text-mist-200",
        "dark:border-b dark:border-mist-800 shadow-inner",
      )}
    >
      <div className="container flex items-center gap-x-4 py-4">
        <div className="flex min-w-0 items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <img src={corsecureLogo} alt={t("header.altText")} className="size-8 rounded-md" />
            <h1 className="text-2xl font-semibold">{t("header.brand")}</h1>
          </div>
          {showTabs && (
            <nav className="hidden items-center gap-x-2 overflow-x-auto p-1 text-sm font-medium md:flex">
              {tabs.map((tab) => {
                if (!access[tab.key]) return null;
                if ((tab.key === "dns" || tab.key === "settings") && !configAvailable) return null;

                return (
                  <NavLink
                    key={tab.to}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-1.5 flex items-center gap-x-1.5 rounded-md text-nowrap",
                        "hover:bg-mist-300/50 dark:hover:bg-mist-800",
                        "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
                        "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
                        isActive
                          ? "bg-mist-300/70 dark:bg-mist-800 text-mist-900 dark:text-mist-50"
                          : "text-mist-600 dark:text-mist-300",
                      )
                    }
                    prefetch="intent"
                    to={tab.to}
                  >
                    <tab.icon className="w-4" />
                    {t(tab.labelKey)}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-x-3">
          <LanguageSwitcher />
          <Menu>
            <MenuTrigger className="size-8 rounded-full p-1">
              <CircleQuestionMark className="w-5" />
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem>
                <Link external to="https://corsecure.net/docs">
                  {t("header.docs")}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link external to="https://corsecure.net">
                  {t("header.brand")}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link external to="https://tailscale.com/download">
                  {t("header.downloadApp")}
                </Link>
              </MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger className="size-8 overflow-hidden rounded-full">
              {user.picture ? (
                <img alt={user.name} className="size-8" src={user.picture} />
              ) : (
                <CircleUser className="size-8" />
              )}
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem disabled>
                <div className="text-mist-900 dark:text-mist-50">
                  {user.subject === "api_key" ? (
                    <>
                      <p className="font-bold">{t("header.apiKey")}</p>
                      <p>{user.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">{user.name}</p>
                      {user.email && <p>{user.email}</p>}
                    </>
                  )}
                </div>
              </MenuItem>
              <MenuSeparator />
              {colorSchemes.map(({ value, labelKey, icon: Icon }) => (
                <MenuItem
                  key={value}
                  onClick={() =>
                    submit(
                      { colorScheme: value, returnTo },
                      { action: "/api/color-scheme", method: "POST" },
                    )
                  }
                >
                  <div className="flex items-center gap-x-2">
                    <Icon className="size-4" />
                    <span className="flex-1">{t(labelKey)}</span>
                    {currentColorScheme === value && <Check className="size-4" />}
                  </div>
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem
                variant="danger"
                onClick={() => submit({}, { action: "/logout", method: "POST" })}
              >
                {t("header.logout")}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>
      {showTabs && (
        <div className="block overflow-x-auto p-2 md:hidden">
          <nav className="flex items-center gap-x-2 text-sm font-medium">
            {tabs.map((tab) => {
              if (!access[tab.key]) return null;
              if ((tab.key === "dns" || tab.key === "settings") && !configAvailable) return null;

              return (
                <NavLink
                  key={tab.to}
                  className={({ isActive }) =>
                    cn(
                      "relative px-3 py-1.5 flex items-center gap-x-1.5 rounded-md text-nowrap",
                      "hover:bg-mist-300/50 dark:hover:bg-mist-800",
                      "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
                      "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
                      "text-mist-600 dark:text-mist-300",
                      isActive &&
                        "text-mist-900 dark:text-mist-50 after:content-[''] after:absolute after:-bottom-2 after:inset-x-1 after:h-0.5 after:rounded-full after:bg-indigo-500",
                    )
                  }
                  prefetch="intent"
                  to={tab.to}
                >
                  <tab.icon className="w-4" />
                  {t(tab.labelKey)}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
