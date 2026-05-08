import { useTranslation } from "react-i18next";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import Code from "~/components/code";
import Notice from "~/components/notice";
import PageError from "~/components/page-error";
import i18n from "~/i18n/config";
import type { AppContext } from "~/server/context";
import { Capabilities } from "~/server/web/roles";

import ManageDomains from "./components/manage-domains";
import ManageNS from "./components/manage-ns";
import ManageRecords from "./components/manage-records";
import RenameTailnet from "./components/rename-tailnet";
import ToggleMagic from "./components/toggle-magic";
import { dnsAction } from "./dns-actions";

// We do not want to expose every config value
export async function loader({ request, context }: LoaderFunctionArgs<AppContext>) {
  if (!context.hs.readable()) {
    throw new Error(i18n.t("dns.noConfig"));
  }

  const principal = await context.auth.require(request);
  const check = context.auth.can(principal, Capabilities.read_network);
  if (!check) {
    // Not authorized to view this page
    throw new Error(i18n.t("dns.noPermission"));
  }

  const writablePermission = context.auth.can(principal, Capabilities.write_network);

  const config = context.hs.c!;
  const dns = {
    prefixes: config.prefixes,
    magicDns: config.dns.magic_dns,
    baseDomain: config.dns.base_domain,
    nameservers: config.dns.nameservers.global,
    splitDns: config.dns.nameservers.split,
    searchDomains: config.dns.search_domains,
    overrideDns: config.dns.override_local_dns,
    extraRecords: context.hs.d,
  };

  return {
    ...dns,
    access: writablePermission,
    writable: context.hs.writable(),
  };
}

export async function action(data: ActionFunctionArgs) {
  return dnsAction(data);
}

export default function Page() {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

  const allNs: Record<string, string[]> = {};
  for (const key of Object.keys(data.splitDns)) {
    allNs[key] = data.splitDns[key];
  }

  allNs.global = data.nameservers;
  const isDisabled = data.access === false || data.writable === false;

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-16">
      {data.writable ? undefined : <Notice>{t("dns.readOnlyNotice")}</Notice>}
      {data.access ? undefined : <Notice>{t("dns.noPermNotice")}</Notice>}
      <RenameTailnet isDisabled={isDisabled} name={data.baseDomain} />
      <ManageNS isDisabled={isDisabled} nameservers={allNs} overrideLocalDns={data.overrideDns} />
      <ManageRecords isDisabled={isDisabled} records={data.extraRecords} />
      <ManageDomains
        isDisabled={isDisabled}
        magic={data.magicDns ? data.baseDomain : undefined}
        searchDomains={data.searchDomains}
      />

      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("dns.magicTitle")}</h1>
        <p className="mb-4">
          {t("dns.magicIntroPre")}
          <Code>
            [device].
            {data.baseDomain}
          </Code>
          {t("dns.magicIntroPost")}
        </p>
        <ToggleMagic isDisabled={isDisabled} isEnabled={data.magicDns} />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return <PageError error={error} page={i18n.t("dns.errorPageName")} />;
}
