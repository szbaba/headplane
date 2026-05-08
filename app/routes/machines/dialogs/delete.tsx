import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Machine } from "~/types";

interface DeleteProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Delete({ machine, isOpen, setIsOpen }: DeleteProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel onSubmit={() => navigate("/machines")} variant="destructive">
        <Title>{t("machinesDialog.removeTitle", { name: machine.givenName })}</Title>
        <Text>{t("machinesDialog.removeDesc")}</Text>
        <input name="action_id" type="hidden" value="delete" />
        <input name="node_id" type="hidden" value={machine.id} />
      </DialogPanel>
    </Dialog>
  );
}
