import { useEffect, useState } from 'react';
import type { PaymentInputs, ValidationResult } from '../lib/validation';
import { isValidUpiId } from '../lib/validation';
import AmountPreset from './AmountPreset';
import {
  deleteProfile,
  getDefaultProfile,
  loadProfiles,
  saveProfile,
  type ReceiverProfile,
} from '../lib/profiles';

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
  const [profiles, setProfiles] = useState<ReceiverProfile[]>([]);
  const [hint, setHint] = useState('');

  // Once: load saved receivers, prefill the default if the form is untouched.
  useEffect(() => {
    const all = loadProfiles();
    setProfiles(all);
    const d = getDefaultProfile();
    if (d && inputs.upiId.trim() === '' && inputs.receiverName.trim() === '') {
      setInputs({ upiId: d.upiId, receiverName: d.name, totalAmount: inputs.totalAmount, maxPerQr: d.maxPerQr, note: d.note });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProfile = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setHint('');
    setInputs({ ...inputs, upiId: p.upiId, receiverName: p.name, maxPerQr: p.maxPerQr, note: p.note });
  };

  const onSave = () => {
    if (!isValidUpiId(inputs.upiId) || inputs.receiverName.trim().length < 2) {
      setHint('need valid id + name to save');
      return;
    }
    setHint('');
    setProfiles(
      saveProfile({
        upiId: inputs.upiId,
        name: inputs.receiverName,
        maxPerQr: inputs.maxPerQr,
        note: inputs.note,
      }),
    );
  };

  const onDelete = (id: string) => {
    setProfiles(deleteProfile(id));
  };

  const selectedId = profiles.find((p) => p.upiId.toLowerCase() === inputs.upiId.trim().toLowerCase())?.id ?? '';

  const inputCls = (bad?: string) =>
    `w-full rounded-lg border bg-night px-4 py-2.5 font-mono text-[14px] text-mist outline-none transition placeholder:text-faint/50 focus:ring-2 ${
      bad
        ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/15'
        : 'border-white/10 focus:border-gold/60 focus:ring-gold/15'
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[12px] font-bold text-gold">[@]</span>
        {profiles.length > 0 ? (
          <select
            aria-label="Saved receivers"
            value={selectedId}
            onChange={(e) => applyProfile(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-night px-2 py-1.5 font-mono text-[12px] text-mist outline-none focus:border-gold/60"
          >
            <option value="">saved receivers…</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.upiId}{p.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono text-[11px] text-faint">no saved receivers yet</span>
        )}
        <button
          type="button"
          onClick={onSave}
          title="Save receiver"
          className="shrink-0 rounded-md border border-gold/50 bg-gold/10 px-2.5 py-1.5 font-mono text-[11px] font-bold text-gold transition hover:bg-gold/20 active:scale-95"
        >
          save
        </button>
        {selectedId && (
          <button
            type="button"
            onClick={() => onDelete(selectedId)}
            title="Delete receiver"
            className="shrink-0 rounded-md border border-white/10 px-2 py-1.5 font-mono text-[11px] text-faint transition hover:border-rose-500/50 hover:text-rose-400 active:scale-95"
          >
            x
          </button>
        )}
      </div>
      {hint && <p className="-mt-2 font-mono text-[11px] text-gold">{hint}</p>}

      <div>
        <Label htmlFor="upiId">upi_id</Label>
        <input
          id="upiId"
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          placeholder="example@upi"
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
          placeholder="Example Name"
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
