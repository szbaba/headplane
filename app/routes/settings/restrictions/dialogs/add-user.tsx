import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import i18n from "~/i18n/config";

const userSchema = type({
  user: "string > 0",
});

interface AddUserProps {
  users: string[];
  isDisabled?: boolean;
}

export default function AddUser({ users, isDisabled }: AddUserProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: userSchema,
    validate: (values) => {
      const user = (values.user as string).trim();
      if (user.length === 0) return undefined;

      if (users.includes(user)) {
        return { user: i18n.t("settings.userListedAlready") };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("settings.addUserBtn")}</Button>
      <DialogPanel>
        <Title>{t("settings.addUserPanelTitle")}</Title>
        <Text className="mb-4">{t("settings.addUserPanelDesc")}</Text>
        <input name="action_id" type="hidden" value="add_user" />
        <Input
          {...form.field("user")}
          description={t("settings.addUserPanelDesc")}
          required
          label={t("settings.userLabel")}
          placeholder={t("settings.userPlaceholder")}
        />
      </DialogPanel>
    </Dialog>
  );
}
