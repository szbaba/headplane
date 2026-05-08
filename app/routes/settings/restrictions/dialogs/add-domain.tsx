import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import i18n from "~/i18n/config";

const domainSchema = type({
  domain: "string > 0",
});

interface AddDomainProps {
  domains: string[];
  isDisabled?: boolean;
}

export default function AddDomain({ domains, isDisabled }: AddDomainProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: domainSchema,
    validate: (values) => {
      const domain = (values.domain as string).trim();
      if (domain.length === 0) return undefined;

      if (domains.includes(domain)) {
        return { domain: i18n.t("settings.domainListedAlready") };
      }

      try {
        const url = new URL(`http://${domain}`);
        if (url.hostname !== domain) {
          return { domain: i18n.t("settings.domainNotValid") };
        }
      } catch {
        return { domain: i18n.t("settings.domainNotValid") };
      }

      return undefined;
    },
  });
  const domain = (form.values.domain as string).trim();

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("settings.addDomainBtn")}</Button>
      <DialogPanel>
        <Title>{t("settings.addDomainPanelTitle")}</Title>
        <Text className="mb-4">{t("settings.addDomainPanelDesc")}</Text>
        <input name="action_id" type="hidden" value="add_domain" />
        <Input
          {...form.field("domain")}
          description={
            domain.length > 0
              ? `${t("settings.domainMatchPre")}${domain}`
              : t("settings.domainMatchEmpty")
          }
          required
          label={t("settings.domainLabel")}
          placeholder="example.com"
        />
      </DialogPanel>
    </Dialog>
  );
}
