import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";

interface CreateUserProps {
  isOidc?: boolean;
  isDisabled?: boolean;
}

export default function CreateUser({ isOidc, isDisabled }: CreateUserProps) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("users.addUser")}</Button>
      <DialogPanel>
        <Title>{t("users.createTitle")}</Title>
        <Text className="mb-6">
          {t("users.createDescOidcPre")}
          {isOidc ? t("users.createDescOidc") : t("users.createDescNoOidc")}
          {t("users.createDescPost")}
        </Text>
        <input name="action_id" type="hidden" value="create_user" />
        <div className="flex flex-col gap-4">
          <Input
            required
            label={t("users.username")}
            name="username"
            placeholder={t("users.newUserPlaceholder")}
            type="text"
          />
          <Input
            label={t("users.displayName")}
            name="display_name"
            placeholder={t("users.displayNamePlaceholder")}
            type="text"
          />
          <Input
            label={t("users.email")}
            name="email"
            placeholder={t("users.emailPlaceholder")}
            type="email"
          />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
