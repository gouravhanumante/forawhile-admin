interface SwitchProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ checked, label, disabled = false, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      className={`switch-control${checked ? ' is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-thumb" />
    </button>
  );
}