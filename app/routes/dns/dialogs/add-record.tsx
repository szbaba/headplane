import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import i18n from "~/i18n/config";

const recordSchema = type({
  record_type: "'A' | 'AAAA'",
  record_name: "string > 0",
  record_value: "string > 0",
});

interface Props {
  records: { name: string; type: "A" | "AAAA" | string; value: string }[];
}

export default function AddRecord({ records }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    schema: recordSchema,
    defaultValues: { record_type: "A" },
    validate: (values) => {
      const name = values.record_name as string;
      const ip = values.record_value as string;
      if (name.length === 0 || ip.length === 0) return undefined;

      const lookup = records.find((r) => r.name === name);
      if (lookup?.value === ip) {
        return {
          record_name: i18n.t("dns.recordDuplicate"),
          record_value: i18n.t("dns.recordDuplicate"),
        };
      }

      return undefined;
    },
  });
  const name = form.values.record_name as string;
  const ip = form.values.record_value as string;
  const recordType = form.values.record_type as string;
  const isDuplicate =
    !!form.errors.record_name?.includes("zaten") || !!form.errors.record_name?.includes("already");

  return (
    <Dialog>
      <Button>{t("dns.addRecordButton")}</Button>
      <DialogPanel onSubmit={() => form.reset()}>
        <Title>{t("dns.addRecordButton")}</Title>
        <Text>{t("dns.recordIntro")}</Text>
        <div className="mt-4 flex flex-col gap-2">
          <input type="hidden" name="action_id" value="add_record" />
          <Select
            required
            label={t("dns.recordTypeLabel")}
            name="record_type"
            defaultValue={recordType}
            onValueChange={(v) => {
              if (v) form.setValue("record_type", v);
            }}
            items={[
              { value: "A", label: "A" },
              { value: "AAAA", label: "AAAA" },
            ]}
          />
          <Input
            {...form.field("record_name")}
            required
            label={t("dns.domain")}
            placeholder={t("dns.domainPlaceholder")}
          />
          <Input
            {...form.field("record_value")}
            required
            label={t("dns.recordIPLabel")}
            placeholder={recordType === "AAAA" ? "2001:db8::ff00:42:8329" : "101.101.101.101"}
          />
          {isDuplicate ? (
            <p className="text-sm opacity-50">
              {t("dns.duplicatePre")}
              <Code>{name}</Code>
              {t("dns.duplicateMid")}
              <Code>{ip}</Code>
              {t("dns.duplicateSuffix")}
            </p>
          ) : undefined}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
