import { type } from "arktype";
import { Computer, FileKey2, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import Button from "~/components/button";
import CodeBlock from "~/components/code-block";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~/components/menu";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

import DeviceWizard from "./device-wizard";

const registerSchema = type({
  register_key: "string == 24",
  user: "string > 0",
});

export interface NewMachineProps {
  server: string;
  users: User[];
  isDisabled?: boolean;
  disabledKeys?: string[];
}

export default function NewMachine(data: NewMachineProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const form = useForm({ schema: registerSchema });

  const defaultUserId = data.users[0]?.id ?? "";

  return (
    <>
      {/* Modern wizard — varsayılan akış */}
      <DeviceWizard
        isOpen={wizardOpen}
        onOpenChange={setWizardOpen}
        server={data.server}
        defaultUserId={defaultUserId}
      />

      {/* Klasik: Register Machine Key dialog (advanced kullanım için) */}
      <Dialog isOpen={registerDialog} onOpenChange={setRegisterDialog}>
        <DialogPanel isDisabled={!form.canSubmit}>
          <Title>{t("machinesDialog.registerTitle")}</Title>
          <Text>{t("machinesDialog.registerHelp")}</Text>
          <CodeBlock className="mb-4">{`tailscale up --login-server=${data.server}`}</CodeBlock>
          <input name="action_id" type="hidden" value="register" />
          <Input
            {...form.field("register_key")}
            required
            label={t("machinesDialog.machineKey")}
            placeholder={t("machinesDialog.machineKeyPlaceholder")}
          />
          <Select
            required
            label={t("machinesDialog.owner")}
            name="user"
            onValueChange={(v) => form.setValue("user", v)}
            placeholder={t("machinesDialog.selectUser")}
            items={data.users.map((user) => ({
              value: user.id,
              label: getUserDisplayName(user),
            }))}
          />
        </DialogPanel>
      </Dialog>

      <div className="flex items-center gap-2">
        {/* Ana buton: Sade wizard */}
        <Button
          className="rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-500/90 dark:bg-indigo-500/90 dark:hover:bg-indigo-500/80"
          disabled={data.isDisabled}
          onClick={() => setWizardOpen(true)}
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            {t("machinesDialog.addDevice")}
          </span>
        </Button>

        {/* Gelişmiş: klasik Headplane akışı (Cihaz Anahtarı Kaydet + Erişim Anahtarı) */}
        <Menu disabled={data.isDisabled}>
          <MenuTrigger
            className={
              "rounded-md border border-mist-200 bg-white px-3 py-2 text-sm font-medium text-mist-700 hover:bg-mist-50 dark:border-mist-700 dark:bg-mist-800/50 dark:text-mist-300 dark:hover:bg-mist-700/50"
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              {t("machinesDialog.advancedButton")}
            </span>
          </MenuTrigger>
          <MenuContent>
            <MenuItem
              disabled={data.disabledKeys?.includes("register")}
              onClick={() => setRegisterDialog(true)}
            >
              <div className="flex items-center gap-x-3">
                <Computer className="w-4" />
                {t("machinesDialog.registerMenuItem")}
              </div>
            </MenuItem>
            <MenuItem
              disabled={data.disabledKeys?.includes("pre-auth")}
              onClick={() => navigate("/settings/auth-keys")}
            >
              <div className="flex items-center gap-x-3">
                <FileKey2 className="w-4" />
                {t("machinesDialog.generateMenuItem")}
              </div>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </>
  );
}
