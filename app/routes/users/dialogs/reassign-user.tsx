import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Notice from "~/components/notice";
import RadioGroup from "~/components/radio-group";
import Text from "~/components/text";
import Title from "~/components/title";
import { Roles } from "~/server/web/roles";
import type { Role } from "~/server/web/roles";

interface ReassignProps {
  userId: string;
  displayName: string;
  role: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function useRoleMap() {
  const { t } = useTranslation();
  return (role: string) => {
    switch (role) {
      case "admin":
        return { name: t("users.roleAdmin"), desc: t("users.roleAdminDesc") };
      case "network_admin":
        return { name: t("users.roleNetworkAdmin"), desc: t("users.roleNetworkAdminDesc") };
      case "it_admin":
        return { name: t("users.roleITAdmin"), desc: t("users.roleITAdminDesc") };
      case "auditor":
        return { name: t("users.roleAuditor"), desc: t("users.roleAuditorDesc") };
      case "viewer":
        return { name: t("users.roleViewer"), desc: t("users.roleViewerDesc") };
      case "member":
        return { name: t("users.roleMember"), desc: t("users.roleMemberDesc") };
      default:
        return { name: role, desc: t("users.roleNoDesc") };
    }
  };
}

export default function ReassignUser({
  userId,
  displayName,
  role,
  isOpen,
  setIsOpen,
}: ReassignProps) {
  const { t } = useTranslation();
  const mapRoleToName = useRoleMap();
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant={role === "owner" ? "unactionable" : "normal"}>
        <Title>{t("users.changeRole", { name: displayName })}</Title>
        <Text className="mb-6">
          {t("users.rolesIntro")}
          <Link external styled to="https://tailscale.com/kb/1138/user-roles">
            {t("common.learnMore")}
          </Link>
        </Text>
        {role === "owner" ? (
          <Notice>{t("users.ownerCannotReassign")}</Notice>
        ) : (
          <>
            <input name="action_id" type="hidden" value="reassign_user" />
            <input name="user_id" type="hidden" value={userId} />
            <RadioGroup
              className="gap-4"
              defaultValue={role}
              label={t("users.role")}
              name="new_role"
            >
              {Object.keys(Roles)
                .filter((r) => r !== "owner")
                .map((r) => {
                  const { name, desc } = mapRoleToName(r);
                  return (
                    <RadioGroup.Radio key={r} label={name} value={r}>
                      <div className="block">
                        <p className="font-bold">{name}</p>
                        <p className="opacity-70">{desc}</p>
                      </div>
                    </RadioGroup.Radio>
                  );
                })}
            </RadioGroup>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
