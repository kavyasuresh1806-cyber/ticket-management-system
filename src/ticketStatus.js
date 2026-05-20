export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "inprogress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

export function statusLabel(value) {
  const found = STATUS_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value;
}
