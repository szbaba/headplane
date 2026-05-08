import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import i18n from "~/i18n/config";

const groupSchema = type({
  group: "string > 0",
});

interface AddGroupProps {
  groups: string[];
  isDisabled?: boolean;
}

export default function AddGroup({ groups, isDisabled }: AddGroupProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: groupSchema,
    validate: (values) => {
      const group = (values.group as string).trim();
      if (group.length === 0) return undefined;

      if (groups.includes(group)) {
        return { group: i18n.t("settings.groupListedAlready") };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("settings.addGroupBtn")}</Button>
      <DialogPanel>
        <Title>{t("settings.addGroupPanelTitle")}</Title>
        <Text className="mb-4">{t("settings.addGroupPanelDesc")}</Text>
        <input name="action_id" type="hidden" value="add_group" />
        <Input
          {...form.field("group")}
          description={t("settings.addGroupPanelDesc")}
          required
          label={t("settings.groupLabel")}
          placeholder={t("settings.groupPlaceholder")}
        />
      </DialogPanel>
    </Dialog>
  );
}
