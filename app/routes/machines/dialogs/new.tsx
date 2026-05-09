import { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import type { User } from "~/types";

import DeviceWizard from "./device-wizard";

export interface NewMachineProps {
  server: string;
  users: User[];
  isDisabled?: boolean;
  disabledKeys?: string[];
}

export default function NewMachine(data: NewMachineProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Wizard varsayılan kullanıcısı: ilk kullanıcı (genelde "default").
  // Müşteri akışında tek user olur; çoklu user senaryosunda sonra dropdown
  // eklenebilir ama şu an basit tutuyoruz (Süleyman: "saas'taki gibi sade").
  const defaultUserId = data.users[0]?.id ?? "";

  return (
    <>
      <DeviceWizard
        isOpen={open}
        onOpenChange={setOpen}
        server={data.server}
        defaultUserId={defaultUserId}
      />
      <Button
        className="rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-500/90 dark:bg-indigo-500/90 dark:hover:bg-indigo-500/80"
        disabled={data.isDisabled}
        onClick={() => setOpen(true)}
      >
        {t("machinesDialog.addDevice")}
      </Button>
    </>
  );
}
