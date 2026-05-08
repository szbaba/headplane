import { AlertCircle } from "lucide-react";
import { isRouteErrorResponse } from "react-router";

import i18n from "~/i18n/config";
import { isApiError, isConnectionError } from "~/server/headscale/api/error-client";
import cn from "~/utils/cn";

import Card from "./card";
import Code from "./code";
import Link from "./link";

export function getErrorMessage(error: Error | unknown): {
  title: string;
  jsxMessage: React.ReactNode;
} {
  const t = (key: string) => i18n.t(key);

  if (isRouteErrorResponse(error)) {
    if (isApiError(error.data)) {
      const { statusCode, rawData, data, requestUrl } = error.data;
      if (statusCode >= 500) {
        return {
          jsxMessage: (
            <>
              <Card.Text>{t("errors.headscaleApiServerError")}</Card.Text>
              {(error.data.data != null || error.data.rawData != null) && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
                  {error.data.data != null ? (
                    <code>{JSON.stringify(error.data.data, null, 2)}</code>
                  ) : (
                    <code>{error.data.rawData}</code>
                  )}
                </pre>
              )}
            </>
          ),
          title: t("errors.headscaleApiError"),
        };
      }

      const authError = error.data.statusCode === 401 || error.data.statusCode === 403;

      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">
              {t("errors.unexpectedResponse")}{" "}
              {authError ? t("errors.authError") : t("errors.unsupportedHeadscale")}
            </Card.Text>
            <ul className="mt-2 list-inside list-disc">
              <li>
                {t("errors.requestUrl")}
                <Code>{requestUrl}</Code>
              </li>
              <li>
                {t("errors.statusCode")}
                <Code>
                  {/* @ts-expect-error */}
                  {data === null ? (
                    <>
                      {statusCode} {rawData}
                    </>
                  ) : (
                    <>
                      {statusCode} {error.statusText}
                    </>
                  )}
                </Code>
              </li>
            </ul>
            <Card.Text className="mt-4 text-lg font-semibold">{t("errors.errorDetails")}</Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              <code>{JSON.stringify(error.data, null, 2)}</code>
            </pre>
          </>
        ),
        title: t("errors.invalidResponse"),
      };
    }

    if (isConnectionError(error.data)) {
      const { requestUrl, errorCode, errorMessage, extraData } = error.data;
      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">{t("errors.cannotConnectDesc")}</Card.Text>
            <Card.Text className="mt-4 text-lg font-semibold">{t("errors.errorDetails")}</Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              {requestUrl}
              <br />
              {errorCode}: {errorMessage}
              {extraData != null && (
                <>
                  <br />
                  <br />
                  <code>{JSON.stringify(extraData, null, 2)}</code>
                </>
              )}
            </pre>
          </>
        ),
        title: t("errors.cannotConnect"),
      };
    }

    return {
      jsxMessage: (
        <>
          {t("errors.genericIntro")}
          <br />
          {t("errors.statusCode")}
          <strong>{error.status}</strong>
          <br />
          <strong>{error.data}</strong>
        </>
      ),
      title: `${t("errors.errorPrefix")}${error.status}`,
    };
  }

  if (!(error instanceof Error)) {
    return {
      jsxMessage: (
        <>
          <Card.Text>
            {t("errors.unexpectedErrorDesc")}
            <Link external styled to="https://github.com/tale/headplane/issues">
              {t("errors.ghIssueLink")}
            </Link>
            {t("errors.ghIssueLinkSuffix")}
          </Card.Text>
          <Card.Text className="mt-4 text-lg font-semibold">{t("errors.errorDetails")}</Card.Text>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
            <code>{JSON.stringify(error, null, 2)}</code>
          </pre>
        </>
      ),
      title: t("errors.unexpectedError"),
    };
  }

  // Traverse the error chain to find the root cause
  let rootError = error;
  if (error.cause != null) {
    rootError = error.cause as Error;
    while (rootError.cause != null) {
      rootError = rootError.cause as Error;
    }
  }

  // TODO: If we are aggregate, concat into a single message
  if (rootError instanceof AggregateError) {
    throw new Error("AggregateError handling not implemented yet");
  }

  return {
    jsxMessage: rootError.message,
    title:
      rootError.name.length > 0 && rootError.name !== "Error"
        ? `${t("errors.errorPrefix")}: ${rootError.name}`
        : t("errors.errorPrefix").trim(),
  };
}

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  const { title, jsxMessage } = getErrorMessage(error);

  return (
    <Card className={cn("w-screen", className)} variant="flat">
      <div className="flex items-center justify-between gap-4">
        <Card.Title>{title}</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      {jsxMessage}
    </Card>
  );
}
