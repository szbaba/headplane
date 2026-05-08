import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";

interface Props {
  isEnabled: boolean;
  isDisabled: boolean;
}

export default function Modal({ isEnabled, isDisabled }: Props) {
  return (
    <Dialog>
      <Button disabled={isDisabled}>{isEnabled ? "Disable" : "Enable"} Akıllı DNS</Button>
      <DialogPanel isDisabled={isDisabled}>
        <Title>{isEnabled ? "Disable" : "Enable"} Akıllı DNS</Title>
        <Text>
          Devices will no longer be accessible via your güvenli ağ domain. The search domain will also
          be disabled.
        </Text>
        <input type="hidden" name="action_id" value="toggle_magic" />
        <input type="hidden" name="new_state" value={isEnabled ? "disabled" : "enabled"} />
      </DialogPanel>
    </Dialog>
  );
}
