import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { User } from "~/types";

interface RenameProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// TODO: Server side validation before submitting
export default function RenameUser({ user, isOpen, setIsOpen }: RenameProps) {
  const { t } = useTranslation();
  const name = user.name || user.displayName;
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel>
        <Title>{t("users.renameUserPrompt", { name })}</Title>
        <Text className="mb-6">{t("users.renameUserDesc", { name })}</Text>
        <input name="action_id" type="hidden" value="rename_user" />
        <input name="user_id" type="hidden" value={user.id} />
        <Input
          defaultValue={user.name}
          required
          label={t("users.username")}
          name="new_name"
          placeholder={t("users.newNamePlaceholder")}
        />
      </DialogPanel>
    </Dialog>
  );
}
