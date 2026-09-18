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
      <div className="flex flex-wrap gap-1.5">
        {(PRESETS as readonly number[]).map((p) => {
          const active = numeric === p && value.trim() !== '';
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(String(p))}
              className={`rounded-md px-3 py-1.5 font-mono text-[12px] font-semibold transition active:scale-95 ${
                active
                  ? 'bg-gold text-night shadow-md shadow-gold/20'
                  : 'border border-white/10 bg-white/5 text-faint hover:border-gold/50 hover:text-gold'
              }`}
            >
              {formatINR(p)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange('')}
          className={`rounded-md px-3 py-1.5 font-mono text-[12px] font-semibold transition active:scale-95 ${
            isCustom || value.trim() === ''
              ? 'bg-mist text-night shadow-md'
              : 'border border-white/10 bg-white/5 text-faint hover:border-white/25'
          }`}
        >
          custom
        </button>
      </div>
      <p className="mt-1.5 font-mono text-[10.5px] text-faint/70">presets = convenience only</p>
    </div>
  );
}
