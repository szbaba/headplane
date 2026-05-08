import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import Link from "~/components/link";
import PageError from "~/components/page-error";
import i18n from "~/i18n/config";

import type { Route } from "./+types/overview";

export async function loader({ context }: Route.LoaderArgs) {
  return {
    config: context.hs.writable(),
    isOidcEnabled: context.oidc?.service.status().state === "ready",
  };
}

export default function Page({ loaderData: { config, isOidcEnabled } }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.title")}</h1>
        <p>{t("settings.underConstruction")}</p>
      </div>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.authKeys")}</h1>
        <p>
          {t("settings.authKeysIntro")}
          <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
            {t("settings.authKeysIntroLink")}
          </Link>
          {t("settings.authKeysIntroTail")}
        </p>
      </div>
      <Link to="/settings/auth-keys">
        <div className="flex items-center text-lg font-medium">
          {t("settings.manageAuthKeys")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.agentTitle")}</h1>
        <p>{t("settings.agentDesc")}</p>
      </div>
      <Link to="/settings/agent">
        <div className="flex items-center text-lg font-medium">
          {t("settings.agentSettings")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      {config && isOidcEnabled ? (
        <>
          <div className="flex w-full flex-col sm:w-2/3">
            <h1 className="mb-4 text-2xl font-medium">{t("settings.restrictionsTitle")}</h1>
            <p>
              {t("settings.restrictionsDesc")}
              <Link external styled to="https://headscale.net/stable/ref/oidc/#basic-configuration">
                {t("settings.restrictionsLearnMore")}
              </Link>
            </p>
          </div>
          <Link to="/settings/restrictions">
            <div className="flex items-center text-lg font-medium">
              {t("settings.manageRestrictions")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </>
      ) : undefined}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PageError error={error} page={i18n.t("settings.errorPageName")} />;
}
