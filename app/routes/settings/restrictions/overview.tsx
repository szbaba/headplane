import { useTranslation } from "react-i18next";
import { data } from "react-router";

import Link from "~/components/link";
import Notice from "~/components/notice";
import i18n from "~/i18n/config";
import { Capabilities } from "~/server/web/roles";

import type { Route } from "./+types/overview";
import { restrictionAction } from "./actions";
import AddDomain from "./dialogs/add-domain";
import AddGroup from "./dialogs/add-group";
import AddUser from "./dialogs/add-user";
import RestrictionTable from "./table";

export async function loader({ request, context }: Route.LoaderArgs) {
  const principal = await context.auth.require(request);
  const check = context.auth.can(principal, Capabilities.read_users);
  if (!check) {
    throw data(i18n.t("settings.iamNoPermission"), {
      status: 403,
    });
  }

  if (!context.hs.c?.oidc) {
    throw data(i18n.t("settings.oidcNotConfigured"), {
      status: 501,
    });
  }

  return {
    access: context.auth.can(principal, Capabilities.configure_iam),
    settings: {
      domains: [...new Set(context.hs.c.oidc.allowed_domains)],
      groups: [...new Set(context.hs.c.oidc.allowed_groups)],
      users: [...new Set(context.hs.c.oidc.allowed_users)],
    },
    writable: context.hs.writable(),
  };
}

export const action = restrictionAction;

export default function Page({ loaderData: { access, writable, settings } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isDisabled = writable ? !access : true;

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-4">
      <div className="flex w-full flex-col sm:w-2/3">
        <p className="text-md mb-4">
          <Link className="font-medium" to="/settings">
            {t("settings.breadcrumb")}
          </Link>
          <span className="mx-2">/</span> {t("settings.restrictionsBreadcrumb")}
        </p>
        {!access ? (
          <Notice title={t("settings.restrictionsPermDenied")} variant="warning">
            {t("settings.restrictionsPermDeniedDesc")}
          </Notice>
        ) : !writable ? (
          <Notice title={t("settings.configLocked")} variant="error">
            {t("settings.configLockedDesc")}
          </Notice>
        ) : undefined}
        <h1 className="mt-4 mb-2 text-2xl font-medium">
          {t("settings.restrictionsOverviewTitle")}
        </h1>
        <p>
          {t("settings.restrictionsOverviewDesc")}
          <Link external styled to="https://headscale.net/stable/ref/oidc/#basic-configuration">
            {t("settings.restrictionsLearnMore")}
          </Link>
        </p>
      </div>
      <RestrictionTable isDisabled={isDisabled} type="domain" values={settings.domains}>
        <AddDomain domains={settings.domains} isDisabled={isDisabled} />
      </RestrictionTable>
      <RestrictionTable isDisabled={isDisabled} type="group" values={settings.groups}>
        <AddGroup groups={settings.groups} isDisabled={isDisabled} />
      </RestrictionTable>
      <RestrictionTable isDisabled={isDisabled} type="user" values={settings.users}>
        <AddUser isDisabled={isDisabled} users={settings.users} />
      </RestrictionTable>
    </div>
  );
}
