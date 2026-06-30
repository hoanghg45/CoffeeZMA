import type { Variant } from "@muoi/core";

export function SingleOptionPicker({
  variant,
  value,
  onChange,
}: {
  variant: Variant;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{variant.label}</p>
      <div className="grid grid-cols-3 gap-2">
        {variant.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`px-2 py-2 rounded-lg text-xs border ${
              value === option.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-gray-200 text-gray-700"
            }`}
          >
            {option.label ?? option.id}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MultipleOptionPicker({
  variant,
  value,
  onChange,
}: {
  variant: Variant;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{variant.label}</p>
      <div className="flex flex-wrap gap-2">
        {variant.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`px-3 py-2 rounded-full text-xs border ${
              value.includes(option.id)
                ? "border-primary bg-primary text-white"
                : "border-gray-200 text-gray-700"
            }`}
          >
            {option.label ?? option.id}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuantityPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
      <button
        type="button"
        className="w-10 h-10 text-lg font-medium text-gray-600"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        −
      </button>
      <span className="w-10 text-center font-medium">{value}</span>
      <button
        type="button"
        className="w-10 h-10 text-lg font-medium text-gray-600"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
