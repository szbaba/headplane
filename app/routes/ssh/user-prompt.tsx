import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Code from "~/components/code";
import Input from "~/components/input";
import Link from "~/components/link";

interface UserPromptProps {
  hostname: string;
}

export default function UserPrompt({ hostname }: UserPromptProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center">
      <Card>
        <Card.Title>{t("ssh.title")}</Card.Title>
        <Card.Text className="mb-4">
          {t("ssh.introPre")}
          <Code>{hostname}</Code>
          {t("ssh.introPost")}
          <br />
          <br />
          {t("ssh.troubleshootPre")}
          <Link external styled to="https://headplane.net/features/ssh#troubleshooting">
            {t("ssh.troubleshootLink")}
          </Link>
          {t("ssh.troubleshootPost")}
        </Card.Text>
        <Form
          method="GET"
          onSubmit={(e) => {
            const formData = new FormData(e.currentTarget);
            const username = formData.get("user");
            if (!username) {
              e.preventDefault();
              return;
            }

            // We have to do a full navigation, since the page needs a full
            // reload to initialize the SSH connection due to us disabling the
            // revalidator.
            const url = new URL(window.location.href);
            url.searchParams.set("user", username.toString());
            window.location.assign(url.toString());
          }}
        >
          <Input
            labelHidden
            type="text"
            label={t("users.username")}
            name="user"
            placeholder={t("users.usernamePlaceholder")}
            className="mb-2"
            required
          />
          <Button type="submit" variant="heavy" className="w-full">
            {t("ssh.connect")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
