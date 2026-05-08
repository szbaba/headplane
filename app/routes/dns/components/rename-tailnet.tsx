import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";

interface Props {
  name: string;
  isDisabled: boolean;
}

export default function RenameTailnet({ name, isDisabled }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-y-4 sm:w-2/3">
      <h1 className="mb-2 text-2xl font-medium">{t("dns.tailnetName")}</h1>
      <p>
        {t("dns.tailnetIntroPre")}
        <Code>[device].{name}</Code>
        {t("dns.tailnetIntroPost")}
      </p>
      <Input
        className="w-3/5 text-sm font-medium"
        readOnly
        label={t("dns.tailnetNameLabel")}
        labelHidden
        onFocus={(event) => {
          (event.target as HTMLInputElement).select();
        }}
        value={name}
      />
      <Dialog>
        <Button disabled={isDisabled}>{t("dns.renameTailnet")}</Button>
        <DialogPanel isDisabled={isDisabled}>
          <Title>{t("dns.renameTailnet")}</Title>
          <Text className="mb-8">{t("dns.renameTailnetWarn")}</Text>
          <input name="action_id" type="hidden" value="rename_tailnet" />
          <Input
            defaultValue={name}
            required
            label={t("dns.tailnetNameLabel")}
            name="new_name"
            placeholder={t("dns.tailnetNamePlaceholder")}
          />
        </DialogPanel>
      </Dialog>
    </div>
  );
}
