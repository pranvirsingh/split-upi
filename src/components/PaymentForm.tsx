import type { PaymentInputs, ValidationResult } from '../lib/validation';
import AmountPreset from './AmountPreset';

interface Props {
  inputs: PaymentInputs;
  setInputs: (p: PaymentInputs) => void;
  validation: ValidationResult | null;
  onGenerate: () => void;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 font-mono text-[12px] text-rose-400">! {msg}</p>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[11.5px] font-semibold text-faint">
      <span className="text-gold">&gt; </span>{children}
    </label>
  );
}

export default function PaymentForm({ inputs, setInputs, validation, onGenerate }: Props) {
  const set = (k: keyof PaymentInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs({ ...inputs, [k]: e.target.value });

  const err = validation && !validation.ok ? validation.errors : {};
  const inputCls = (bad?: string) =>
    `w-full rounded-lg border bg-night px-4 py-2.5 font-mono text-[14px] text-mist outline-none transition placeholder:text-faint/50 focus:ring-2 ${
      bad
        ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/15'
        : 'border-white/10 focus:border-gold/60 focus:ring-gold/15'
    }`;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="upiId">upi_id</Label>
        <input
          id="upiId"
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          placeholder="name@upi"
          value={inputs.upiId}
          onChange={set('upiId')}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          className={inputCls(err.upiId)}
        />
        <FieldError msg={err.upiId} />
      </div>

      <div>
        <Label htmlFor="rname">receiver</Label>
        <input
          id="rname"
          autoComplete="off"
          placeholder="Mohit Kumar"
          value={inputs.receiverName}
          onChange={set('receiverName')}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          className={inputCls(err.receiverName)}
        />
        <FieldError msg={err.receiverName} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="total">total ₹</Label>
          <input
            id="total"
            inputMode="decimal"
            autoComplete="off"
            placeholder="4500"
            value={inputs.totalAmount}
            onChange={set('totalAmount')}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            className={inputCls(err.totalAmount)}
          />
          <FieldError msg={err.totalAmount} />
        </div>
        <div>
          <Label htmlFor="maxqr">max/qr ₹</Label>
          <input
            id="maxqr"
            inputMode="decimal"
            autoComplete="off"
            placeholder="1999"
            value={inputs.maxPerQr}
            onChange={set('maxPerQr')}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            className={inputCls(err.maxPerQr)}
          />
          <FieldError msg={err.maxPerQr} />
        </div>
      </div>

      <AmountPreset value={inputs.maxPerQr} onChange={(v) => setInputs({ ...inputs, maxPerQr: v })} />

      <div>
        <Label htmlFor="note">note?</Label>
        <input
          id="note"
          autoComplete="off"
          placeholder="Invoice 001"
          maxLength={80}
          value={inputs.note}
          onChange={set('note')}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          className={inputCls()}
        />
      </div>

      {err.general && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 font-mono text-[12.5px] text-rose-300">
          {err.general}
        </div>
      )}

      <button
        onClick={onGenerate}
        className="w-full rounded-xl bg-gold px-6 py-3.5 font-mono text-[15px] font-bold text-night shadow-xl shadow-gold/20 transition hover:brightness-110 active:scale-[.99]"
      >
        $ generate_qr
      </button>
    </div>
  );
}
