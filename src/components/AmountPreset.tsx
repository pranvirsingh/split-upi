import { PRESETS } from '../lib/constants';
import { formatINR } from '../lib/format';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function AmountPreset({ value, onChange }: Props) {
  const numeric = Number(value.replace(/,/g, ''));
  const isCustom = value.trim() !== '' && !(PRESETS as readonly number[]).includes(numeric);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(PRESETS as readonly number[]).map((p) => {
          const active = numeric === p && value.trim() !== '';
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(String(p))}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95 ${
                active
                  ? 'bg-forest text-white shadow-md shadow-forest/30'
                  : 'border border-ink/10 bg-white text-stone-600 hover:border-forest/40 hover:text-forest'
              }`}
            >
              ₹{formatINR(p)}/-
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange('')}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95 ${
            isCustom || value.trim() === ''
              ? 'bg-ink text-white shadow-md'
              : 'border border-ink/10 bg-white text-stone-600 hover:border-ink/25'
          }`}
        >
          Custom
        </button>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-stone-400">
        Convenience options only — not official limits.
      </p>
    </div>
  );
}
