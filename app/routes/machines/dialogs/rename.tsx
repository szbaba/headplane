import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { Machine } from "~/types";

const renameSchema = type({
  name: "string > 0",
});

interface RenameProps {
  machine: Machine;
  isOpen: boolean;
  magic?: string;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Rename({ machine, magic, isOpen, setIsOpen }: RenameProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: renameSchema,
    defaultValues: { name: machine.givenName },
  });
  const name = form.values.name as string;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel>
        <Title>{t("machinesDialog.renameTitle", { name: machine.givenName })}</Title>
        <Text className="mb-6">{t("machinesDialog.renameDesc")}</Text>
        <input name="action_id" type="hidden" value="rename" />
        <input name="node_id" type="hidden" value={machine.id} />
        <Input
          {...form.field("name")}
          required
          label={t("machines.machineName")}
          placeholder={t("machines.machineNamePlaceholder")}
        />
        {magic ? (
          name.length > 0 && name !== machine.givenName ? (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              {t("machinesDialog.renameHostnameNew")}
              <Code className="text-sm">{name.toLowerCase().replaceAll(/\s+/g, "-")}</Code>
              {t("machinesDialog.renameHostnameOldSuffix")}
              <Code className="text-sm">{machine.givenName}</Code>.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              {t("machinesDialog.renameHostnameSame")}
              <Code className="text-sm">{machine.givenName}</Code>.
            </p>
          )
        ) : undefined}
      </DialogPanel>
    </Dialog>
  );
}
