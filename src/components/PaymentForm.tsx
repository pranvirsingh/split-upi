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
  return <p className="mt-1.5 text-[13px] font-medium text-rose-600">{msg}</p>;
}

export default function PaymentForm({ inputs, setInputs, validation, onGenerate }: Props) {
  const set = (k: keyof PaymentInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs({ ...inputs, [k]: e.target.value });

  const err = validation && !validation.ok ? validation.errors : {};
  const inputCls = (bad?: string) =>
    `w-full rounded-xl border bg-paper px-4 py-3 text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:bg-white focus:ring-4 ${
      bad
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
        : 'border-ink/10 focus:border-forest focus:ring-forest/15'
    }`;

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_20px_60px_-24px_rgba(23,59,46,.22)]">
      <div className="border-b border-ink/10 px-6 pb-5 pt-6 sm:px-8">
        <h2 className="text-[19px] font-extrabold tracking-tight text-ink">Payment details</h2>
        <p className="mt-1 text-[14px] text-stone-500">UPI details + the full amount to collect.</p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        <div>
          <label htmlFor="upiId" className="mb-1.5 block text-[13.5px] font-semibold text-stone-700">
            Your UPI ID
          </label>
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
          <label htmlFor="rname" className="mb-1.5 block text-[13.5px] font-semibold text-stone-700">
            Receiver Name
          </label>
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="total" className="mb-1.5 block text-[13.5px] font-semibold text-stone-700">
              Total Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-stone-400">
                ₹
              </span>
              <input
                id="total"
                inputMode="decimal"
                autoComplete="off"
                placeholder="4500"
                value={inputs.totalAmount}
                onChange={set('totalAmount')}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                className={`${inputCls(err.totalAmount)} pl-9 font-semibold`}
              />
            </div>
            <FieldError msg={err.totalAmount} />
          </div>
          <div>
            <label htmlFor="maxqr" className="mb-1.5 block text-[13.5px] font-semibold text-stone-700">
              Max Per QR
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-stone-400">
                ₹
              </span>
              <input
                id="maxqr"
                inputMode="decimal"
                autoComplete="off"
                placeholder="1999"
                value={inputs.maxPerQr}
                onChange={set('maxPerQr')}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                className={`${inputCls(err.maxPerQr)} pl-9 font-semibold`}
              />
            </div>
            <FieldError msg={err.maxPerQr} />
          </div>
        </div>

        <AmountPreset value={inputs.maxPerQr} onChange={(v) => setInputs({ ...inputs, maxPerQr: v })} />

        <div>
          <label htmlFor="note" className="mb-1.5 block text-[13.5px] font-semibold text-stone-700">
            Note <span className="ml-1 font-medium text-stone-400">Optional</span>
          </label>
          <input
            id="note"
            autoComplete="off"
            placeholder="e.g. Invoice 001"
            maxLength={80}
            value={inputs.note}
            onChange={set('note')}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            className={inputCls()}
          />
        </div>

        {err.general && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] font-medium text-rose-700">
            {err.general}
          </div>
        )}

        <button
          onClick={onGenerate}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-4 text-[16px] font-bold text-white shadow-xl shadow-forest/30 transition hover:bg-pine active:scale-[.99]"
        >
          Generate QR Codes
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </button>
        <p className="flex items-center justify-center gap-1.5 pb-1 text-center text-[12.5px] font-medium text-stone-500">
          <span aria-hidden>🔒</span> Processed on your device.
        </p>
      </div>
    </div>
  );
}
