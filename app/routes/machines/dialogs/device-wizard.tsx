import {
  AlertCircle,
  Apple,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Download,
  Loader2,
  QrCode,
  Smartphone,
  Tablet,
  Terminal as TerminalIcon,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import Button from "~/components/button";
import CodeBlock from "~/components/code-block";
import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Title from "~/components/title";
import type { User } from "~/types";
import cn from "~/utils/cn";

type Platform = "macos" | "ios" | "android" | "windows" | "linux";

interface DeviceWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  server: string; // Headscale public URL — login-server hedefi
  defaultUserId: string; // Otomatik key için kullanılacak user
}

interface CreateKeyResponse {
  success?: boolean;
  key?: string;
  error?: string;
}

const downloadLinks: Record<Platform, { url: string; labelKey: string }> = {
  macos: {
    url: "https://pkgs.tailscale.com/stable/Tailscale-latest-macos.pkg",
    labelKey: "wizard.downloadMacOS",
  },
  ios: {
    url: "https://apps.apple.com/us/app/tailscale/id1470499037",
    labelKey: "wizard.downloadIOS",
  },
  android: {
    url: "https://play.google.com/store/apps/details?id=com.tailscale.ipn",
    labelKey: "wizard.downloadAndroid",
  },
  windows: {
    url: "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe",
    labelKey: "wizard.downloadWindows",
  },
  linux: {
    url: "https://tailscale.com/kb/1031/install-linux",
    labelKey: "wizard.linuxInstall",
  },
};

function CopyableBlock({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard permission could be denied
    }
  };

  return (
    <div className="space-y-1">
      {label ? <p className="text-sm text-mist-600 dark:text-mist-300">{label}</p> : null}
      <div className="relative">
        <CodeBlock>{text}</CodeBlock>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "absolute right-2 top-2",
            "px-2 py-1 rounded-md text-xs",
            "bg-white/90 hover:bg-white text-mist-900",
            "dark:bg-mist-700 dark:hover:bg-mist-600 dark:text-mist-100",
            "border border-mist-200 dark:border-mist-600",
            "flex items-center gap-1",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              {t("wizard.copied")}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              {t("wizard.copyButton")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PlatformButton({
  platform,
  icon: Icon,
  label,
  onClick,
}: {
  platform: Platform;
  icon: typeof Apple;
  label: string;
  onClick: (p: Platform) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(platform)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg",
        "border border-mist-200 dark:border-mist-700",
        "hover:border-indigo-400 hover:bg-indigo-50/50",
        "dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30",
        "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40",
        "transition-colors",
      )}
    >
      <Icon className="h-8 w-8" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function DeviceWizard({
  isOpen,
  onOpenChange,
  server,
  defaultUserId,
}: DeviceWizardProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher<CreateKeyResponse>();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrShown, setQrShown] = useState(false);
  const [qrServerUrl, setQrServerUrl] = useState<string | null>(null);
  const [qrKeyUrl, setQrKeyUrl] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPlatform(null);
      setGeneratedKey(null);
      setError(null);
      setQrShown(false);
      setQrServerUrl(null);
      setQrKeyUrl(null);
    }
  }, [isOpen]);

  // QR kodları üret (mobil için, key oluştuktan sonra göster toggle'lanırsa)
  useEffect(() => {
    if (qrShown && generatedKey && !qrServerUrl) {
      const opts = { width: 240, margin: 2, errorCorrectionLevel: "M" as const };
      Promise.all([QRCode.toDataURL(server, opts), QRCode.toDataURL(generatedKey, opts)])
        .then(([s, k]) => {
          setQrServerUrl(s);
          setQrKeyUrl(k);
        })
        .catch(() => {
          // QR üretimi başarısız olursa toggle'ı geri al
          setQrShown(false);
        });
    }
  }, [qrShown, generatedKey, server, qrServerUrl]);

  // Auto-create key when platform selected
  useEffect(() => {
    if (platform && !generatedKey && fetcher.state === "idle") {
      const form = new FormData();
      form.set("action_id", "add_preauthkey");
      form.set("user_id", defaultUserId);
      form.set("acl_tags", "");
      form.set("expiry", "1"); // 1 day = 24h
      form.set("reusable", "off");
      form.set("ephemeral", "off");
      fetcher.submit(form, { method: "POST", action: "/settings/auth-keys" });
    }
  }, [platform, generatedKey, fetcher.state]);

  // Handle fetcher response
  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success && fetcher.data.key) {
      setGeneratedKey(fetcher.data.key);
      setError(null);
    } else if (fetcher.data.error) {
      setError(fetcher.data.error);
    }
  }, [fetcher.data]);

  const isLoading = fetcher.state !== "idle" && !generatedKey;
  const showInstructions = platform !== null && generatedKey !== null;
  const showLoading = platform !== null && !generatedKey && !error;

  const buildCommand = (p: Platform, key: string): string => {
    switch (p) {
      case "macos":
      case "linux":
        return `sudo tailscale up --login-server=${server} --authkey=${key}`;
      case "windows":
        return `tailscale up --login-server=${server} --authkey=${key}`;
      default:
        return key;
    }
  };

  const isMobile = platform === "ios" || platform === "android";

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <DialogPanel variant="unactionable">
        {!platform ? (
          <>
            <Title>{t("wizard.title")}</Title>
            <p className="mb-4 text-sm text-mist-600 dark:text-mist-300">{t("wizard.subtitle")}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <PlatformButton
                platform="macos"
                icon={Apple}
                label={t("wizard.platformMacOS")}
                onClick={setPlatform}
              />
              <PlatformButton
                platform="ios"
                icon={Smartphone}
                label={t("wizard.platformIOS")}
                onClick={setPlatform}
              />
              <PlatformButton
                platform="android"
                icon={Tablet}
                label={t("wizard.platformAndroid")}
                onClick={setPlatform}
              />
              <PlatformButton
                platform="windows"
                icon={TerminalIcon}
                label={t("wizard.platformWindows")}
                onClick={setPlatform}
              />
              <PlatformButton
                platform="linux"
                icon={TerminalIcon}
                label={t("wizard.platformLinux")}
                onClick={setPlatform}
              />
            </div>
          </>
        ) : showLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-mist-600 dark:text-mist-300">{t("wizard.creatingKey")}</p>
          </div>
        ) : error ? (
          <>
            <Title>{t("wizard.errorTitle")}</Title>
            <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="mt-4">
              <Button onClick={() => setPlatform(null)} variant="light">
                <ChevronLeft className="h-4 w-4" />
                {t("wizard.back")}
              </Button>
            </div>
          </>
        ) : showInstructions && generatedKey ? (
          <>
            <div className="flex items-center justify-between">
              <Title>{t(downloadLinks[platform].labelKey).replace(/^[^—]+—\s*/, "")}</Title>
              <Button onClick={() => setPlatform(null)} variant="ghost">
                <ChevronLeft className="h-4 w-4" />
                {t("wizard.back")}
              </Button>
            </div>

            {/* Step 1: Install */}
            <div className="space-y-2">
              <p className="font-semibold">{t("wizard.stepInstall")}</p>
              <Link external styled to={downloadLinks[platform].url}>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  {t(downloadLinks[platform].labelKey)}
                </span>
              </Link>
              {platform === "macos" ? (
                <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>{t("wizard.warningTitle")}:</strong> {t("wizard.warningMacOS")}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Step 2: Connect */}
            <div className="mt-4 space-y-2">
              <p className="font-semibold">
                {isMobile ? t("wizard.stepMobile") : t("wizard.stepConnect")}
              </p>
              {!isMobile ? (
                <>
                  <p className="text-sm text-mist-600 dark:text-mist-300">
                    {platform === "macos"
                      ? t("wizard.macOSCommand")
                      : platform === "linux"
                        ? t("wizard.linuxCommand")
                        : t("wizard.windowsCommand")}
                  </p>
                  <CopyableBlock text={buildCommand(platform, generatedKey)} />
                </>
              ) : (
                /*
                 * Mobil (iOS/Android) — SaaS DeviceOnboarding pattern:
                 * Birincil yol OIDC akışı (URL + Sign In + tarayıcı corsecure
                 * giriş). Auth-key paste mobil Tailscale uygulamasında
                 * desteklenmiyor zaten; kullanıcıya gösterilen birincil akış
                 * temiz olsun. Auth-key + QR fallback "İleri seviye"
                 * altında collapsible — geek/headless senaryolar için.
                 */
                <div className="space-y-3">
                  <CopyableBlock text={server} label={t("wizard.mobileLoginServer")} />

                  <ol className="list-decimal space-y-2 pl-5 text-sm text-mist-700 marker:text-mist-500 dark:text-mist-200 dark:marker:text-mist-400">
                    <li>{t("wizard.mobileOidcStep1")}</li>
                    <li>{t("wizard.mobileOidcStep2")}</li>
                    <li>{t("wizard.mobileOidcStep3")}</li>
                    <li>{t("wizard.mobileOidcStep4")}</li>
                  </ol>

                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                    {t("wizard.mobileOidcInfo")}
                  </div>

                  {/* İleri seviye — auth-key + QR (gizli, collapsible) */}
                  <details className="mt-2 rounded-md border border-mist-200 bg-mist-50/50 p-3 dark:border-mist-700 dark:bg-mist-900/40">
                    <summary className="cursor-pointer text-sm font-medium text-mist-700 dark:text-mist-200">
                      {t("wizard.advancedAuthKeyTitle")}
                    </summary>
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-mist-600 dark:text-mist-400">
                        {t("wizard.advancedAuthKeyDesc")}
                      </p>
                      <CopyableBlock text={generatedKey} label={t("wizard.mobileAuthKey")} />

                      <button
                        type="button"
                        onClick={() => setQrShown((v) => !v)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md text-sm",
                          "border border-mist-200 dark:border-mist-700",
                          "bg-white dark:bg-mist-800",
                          "px-3 py-1.5 hover:bg-mist-50 dark:hover:bg-mist-700",
                        )}
                      >
                        <QrCode className="h-4 w-4" />
                        {qrShown ? t("wizard.qrHideKey") : t("wizard.qrShowKey")}
                      </button>

                      {qrShown && qrServerUrl && qrKeyUrl ? (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-mist-200 bg-mist-50 p-4 sm:grid-cols-2 dark:border-mist-700 dark:bg-mist-900">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm font-medium">{t("wizard.qrServerLabel")}</p>
                            <img
                              src={qrServerUrl}
                              alt={t("wizard.qrServerLabel")}
                              className="rounded-md bg-white p-2"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm font-medium">{t("wizard.qrKeyLabel")}</p>
                            <img
                              src={qrKeyUrl}
                              alt={t("wizard.qrKeyLabel")}
                              className="rounded-md bg-white p-2"
                            />
                          </div>
                          <p className="col-span-full text-xs text-mist-600 dark:text-mist-400">
                            {t("wizard.qrHint")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-md border border-mist-200 bg-mist-50 p-3 text-sm text-mist-700 dark:border-mist-700 dark:bg-mist-800/50 dark:text-mist-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>{t("wizard.warningExpire")}</span>
            </div>

            <div className="mt-4">
              <Button onClick={() => onOpenChange(false)} variant="heavy">
                {t("wizard.doneButton")}
              </Button>
            </div>
          </>
        ) : null}
      </DialogPanel>
    </Dialog>
  );
}
