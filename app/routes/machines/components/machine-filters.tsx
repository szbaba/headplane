import { ChevronDown, X } from "lucide-react";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import type { User } from "~/types/User";
import cn from "~/utils/cn";
import type { PopulatedNode } from "~/utils/node-info";
import { getUserDisplayName } from "~/utils/user";

import { useMachineFilterParams } from "../hooks/use-machine-filter-params";

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  clearLabel,
}: {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[];
  onChange: (value: string | null) => void;
  clearLabel: string;
}): JSX.Element {
  const activeOption = options.find((o) => o.value === value) ?? null;
  const isActive = activeOption !== null;

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium",
          "border transition-colors",
          "flex items-center gap-1.5",
          isActive
            ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            : "border-mist-200 dark:border-mist-700 text-mist-700 dark:text-mist-300 hover:border-mist-300 dark:hover:border-mist-600",
        )}
      >
        {activeOption?.label ?? label}
        <ChevronDown className="h-3.5 w-3.5" />
      </MenuTrigger>
      <MenuContent>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => onChange(value === option.value ? null : option.value)}
          >
            {option.value === value ? (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {option.label}
              </span>
            ) : (
              option.label
            )}
          </MenuItem>
        ))}
        {isActive && (
          <>
            <MenuSeparator />
            <MenuItem onClick={() => onChange(null)}>{clearLabel}</MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

interface MachineFiltersProps {
  users: User[];
  populatedNodes: PopulatedNode[];
}

export function MachineFilters({ users, populatedNodes }: MachineFiltersProps): JSX.Element {
  const { t } = useTranslation();
  const {
    filterUser,
    filterTag,
    filterStatus,
    filterRoute,
    hasActiveFilters,
    setParam,
    clearFilters,
  } = useMachineFilterParams();

  const STATUS_OPTIONS = [
    { value: "online", label: t("machines.filterStatusOnline") },
    { value: "offline", label: t("machines.filterStatusOffline") },
    { value: "expired", label: t("machines.filterStatusExpired") },
  ];

  const ROUTE_OPTIONS = [
    { value: "exit-node", label: t("machines.filterRouteExitNode") },
    { value: "subnet", label: t("machines.filterRouteSubnet") },
  ];

  const tagOwnedExists = populatedNodes.some((n) => !n.user);
  const userOptions = [
    ...(tagOwnedExists ? [{ value: "tag-owned", label: t("machines.filterTagOwned") }] : []),
    ...users.map((u) => ({ value: u.name, label: getUserDisplayName(u) })),
  ];

  const tagOptions = Array.from(new Set(populatedNodes.flatMap((n) => n.tags)))
    .filter(Boolean)
    .sort()
    .map((tag) => ({ value: tag, label: tag }));

  const clearLabel = t("machines.clearFilter");

  return (
    <>
      {userOptions.length > 0 && (
        <FilterDropdown
          label={t("machines.filterUser")}
          onChange={(v) => setParam("user", v)}
          options={userOptions}
          value={filterUser}
          clearLabel={clearLabel}
        />
      )}
      {tagOptions.length > 0 && (
        <FilterDropdown
          label={t("machines.filterTag")}
          onChange={(v) => setParam("tag", v)}
          options={tagOptions}
          value={filterTag}
          clearLabel={clearLabel}
        />
      )}
      <FilterDropdown
        label={t("machines.filterStatus")}
        onChange={(v) => setParam("status", v)}
        options={STATUS_OPTIONS}
        value={filterStatus}
        clearLabel={clearLabel}
      />
      <FilterDropdown
        label={t("machines.filterRoute")}
        onChange={(v) => setParam("route", v)}
        options={ROUTE_OPTIONS}
        value={filterRoute}
        clearLabel={clearLabel}
      />
      {hasActiveFilters && (
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
            "border border-mist-200 dark:border-mist-700",
            "text-mist-600 dark:text-mist-400",
            "hover:border-mist-300 dark:hover:border-mist-600",
          )}
          onClick={clearFilters}
          type="button"
        >
          {t("machines.clearFilters")}
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}
