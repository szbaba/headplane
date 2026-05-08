import { useTranslation } from "react-i18next";

import Card from "~/components/card";

export default function Logout() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="m-4 max-w-md sm:m-0">
        <Card.Title>{t("login.loggedOutTitle")}</Card.Title>
        <Card.Text>{t("login.loggedOutDesc")}</Card.Text>
      </Card>
    </div>
  );
}
