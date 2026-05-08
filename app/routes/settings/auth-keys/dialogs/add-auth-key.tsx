import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import Button from "~/components/button";
import CodeBlock from "~/components/code-block";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import NumberInput from "~/components/number-input";
import Select from "~/components/select";
import Switch from "~/components/switch";
import Text from "~/components/text";
import Title from "~/components/title";
import type { User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

interface AddAuthKeyProps {
  users: User[];
  url: string;
  selfServiceOnly: boolean;
  currentSubject?: string;
}

function findCurrentUser(users: User[], subject: string | undefined): User | undefined {
  if (!subject) {
    return undefined;
  }
  return users.find((u) => {
    if (u.provider !== "oidc" || !u.providerId) {
      return false;
    }
    const segment = u.providerId.split("/").pop();
    return segment ? decodeURIComponent(segment) === subject : false;
  });
}

export default function AddAuthKey({
  users,
  url,
  selfServiceOnly,
  currentSubject,
}: AddAuthKeyProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const submittingRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reusable, setReusable] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [tagOnly, setTagOnly] = useState(false);
  const currentUser = selfServiceOnly ? findCurrentUser(users, currentSubject) : null;
  const availableUsers = selfServiceOnly && currentUser ? [currentUser] : users;
  const [userId, setUserId] = useState<string | null>(availableUsers[0]?.id);
  const [tags, setTags] = useState("");

  const createdKey = fetcher.data?.success ? fetcher.data.key : null;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      submittingRef.current = false;
    }
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (!isOpen) {
      setReusable(false);
      setEphemeral(false);
      setTagOnly(false);
      setUserId(availableUsers[0]?.id);
      setTags("");
      fetcher.data = undefined;
    }
  }, [isOpen]);

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.startsWith("tag:") ? t : `tag:${t}`));

  const canSubmit = tagOnly ? parsedTags.length > 0 : userId != null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && submittingRef.current) {
          return;
        }
        setIsOpen(open);
      }}
    >
      <Button className="my-4" onClick={() => setIsOpen(true)}>
        {t("authKeys.createKey")}
      </Button>
      {createdKey ? (
        <DialogPanel variant="unactionable">
          <Title>{t("authKeys.createdTitle")}</Title>
          <Text>{t("authKeys.createdWarning")}</Text>
          <CodeBlock className="mt-4">{createdKey}</CodeBlock>
          <Text className="mt-4 text-sm">{t("authKeys.registerHint")}</Text>
          <CodeBlock className="mt-1">
            {`tailscale up --login-server=${url} --authkey ${createdKey}`}
          </CodeBlock>
        </DialogPanel>
      ) : (
        <DialogPanel
          onSubmit={(event) => {
            event.preventDefault();
            submittingRef.current = true;
            const form = new FormData(event.currentTarget as HTMLFormElement);
            form.set("action_id", "add_preauthkey");
            form.set("user_id", tagOnly ? "" : (userId?.toString() ?? ""));
            form.set("reusable", reusable ? "on" : "off");
            form.set("ephemeral", ephemeral ? "on" : "off");
            form.set("acl_tags", parsedTags.join(","));
            fetcher.submit(form, { method: "POST" });
          }}
          isDisabled={fetcher.state !== "idle" || !canSubmit}
        >
          <Title>{t("authKeys.generateKey")}</Title>

          {!selfServiceOnly && (
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <Text className="font-semibold">{t("authKeys.tagOnlyKey")}</Text>
                <Text className="text-sm">{t("authKeys.tagOnlyKeyDesc")}</Text>
              </div>
              <Switch
                defaultChecked={tagOnly}
                label={t("authKeys.tagOnlyKey")}
                onCheckedChange={() => setTagOnly(!tagOnly)}
              />
            </div>
          )}

          {!tagOnly && (
            <Select
              className="mb-2"
              description={
                selfServiceOnly ? t("authKeys.selfServiceDesc") : t("authKeys.userFieldDesc")
              }
              disabled={selfServiceOnly}
              required
              label={t("authKeys.userField")}
              onValueChange={(value) => setUserId(value)}
              placeholder={t("authKeys.selectUser")}
              value={userId}
              items={availableUsers.map((user) => ({
                value: user.id,
                label: getUserDisplayName(user),
              }))}
            />
          )}

          <Input
            className="mb-2"
            description={t("authKeys.aclTagsDesc")}
            required={tagOnly}
            label={t("authKeys.aclTags")}
            onChange={(value) => setTags(value)}
            placeholder={t("authKeys.aclTagsPlaceholder")}
            value={tags}
          />
          <NumberInput
            defaultValue={90}
            description={t("authKeys.expirationDesc")}
            required
            label={t("authKeys.expiration")}
            max={365_000}
            min={1}
            name="expiry"
          />
          <div className="mt-6 flex items-center justify-between gap-2">
            <div>
              <Text className="font-semibold">{t("authKeys.reusable")}</Text>
              <Text className="text-sm">{t("authKeys.reusableDesc")}</Text>
            </div>
            <Switch
              defaultChecked={reusable}
              label={t("authKeys.reusable")}
              onCheckedChange={() => setReusable(!reusable)}
            />
          </div>
          <div className="mt-6 flex items-center justify-between gap-2">
            <div>
              <Text className="font-semibold">{t("authKeys.ephemeral")}</Text>
              <Text className="text-sm">
                {t("authKeys.ephemeralDesc")}
                <Link external styled to="https://tailscale.com/kb/1111/ephemeral-nodes">
                  {t("common.learnMore")}
                </Link>
              </Text>
            </div>
            <Switch
              defaultChecked={ephemeral}
              label={t("authKeys.ephemeral")}
              onCheckedChange={() => setEphemeral(!ephemeral)}
            />
          </div>
        </DialogPanel>
      )}
    </Dialog>
  );
}
