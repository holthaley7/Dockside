import { useRef, useState } from "react";
import { submitCatch, SD_LOCATIONS, type CatchReport } from "../lib/api";

interface Props {
  slug: string;
  speciesName: string;
  onSubmitted: (report: CatchReport) => void;
  onClose: () => void;
}

const TIDE_OPTIONS = [
  "Incoming High",
  "Incoming Low",
  "Outgoing High",
  "Outgoing Low",
  "Slack",
];
const WEATHER_OPTIONS = ["Sunny", "Partly Cloudy", "Overcast", "Foggy", "Windy"];

const today = new Date().toISOString().split("T")[0];

export default function CatchForm({ slug, speciesName, onSubmitted, onClose }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const [noteLen, setNoteLen] = useState(0);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPhotoPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setSubmitting(true);
    setErrors({});

    const fd = new FormData(formRef.current);
    try {
      const report = await submitCatch(slug, fd);
      onSubmitted(report);
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string> };
      if (apiErr.errors) {
        setErrors(apiErr.errors);
      } else {
        setErrors({ _form: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto bg-navy-900 border border-navy-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-navy-900 border-b border-navy-700/50">
          <div>
            <h2 className="text-base font-bold text-gray-100">Log Your Catch</h2>
            <p className="text-xs font-mono text-sand/70 mt-0.5">{speciesName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5">
          {errors._form && (
            <p className="text-red-400 text-sm font-mono bg-red-950/40 rounded-lg px-3 py-2">
              {errors._form}
            </p>
          )}

          {/* Username */}
          <Field label="Username" required error={errors.username}>
            <input
              name="username"
              type="text"
              placeholder="3–20 characters"
              maxLength={20}
              className={inputCls(!!errors.username)}
            />
          </Field>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date Caught" required error={errors.dateCaught}>
              <input
                name="dateCaught"
                type="date"
                max={today}
                className={inputCls(!!errors.dateCaught)}
              />
            </Field>
            <Field label="Time Caught" required error={errors.timeCaught}>
              <input
                name="timeCaught"
                type="time"
                className={inputCls(!!errors.timeCaught)}
              />
            </Field>
          </div>

          {/* Location */}
          <Field label="Location" required error={errors.locationName}>
            <select
              name="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className={inputCls(!!errors.locationName)}
            >
              <option value="">Select a location…</option>
              {SD_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </Field>
          {locationName === "Other" && (
            <Field label="Describe Location" required error={errors.locationOther}>
              <input
                name="locationOther"
                type="text"
                placeholder="e.g. Imperial Beach Pier"
                className={inputCls(!!errors.locationOther)}
              />
            </Field>
          )}

          {/* Weight + Length row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight (lbs)" required error={errors.weightLbs}>
              <input
                name="weightLbs"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0.0"
                className={inputCls(!!errors.weightLbs)}
              />
            </Field>
            <Field label="Length (in)" error={errors.lengthIn}>
              <input
                name="lengthIn"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Optional"
                className={inputCls(!!errors.lengthIn)}
              />
            </Field>
          </div>

          {/* Bait/lure */}
          <Field label="Bait / Lure Used">
            <input
              name="baitUsed"
              type="text"
              placeholder="e.g. Live sardine, Nomad DTX"
              className={inputCls(false)}
            />
          </Field>

          {/* Tide + Weather row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tide Conditions">
              <select name="tideConditions" className={inputCls(false)}>
                <option value="">Unknown</option>
                {TIDE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Weather">
              <select name="weatherConditions" className={inputCls(false)}>
                <option value="">Unknown</option>
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Water temp */}
          <Field label="Water Temp (°F)">
            <input
              name="waterTempF"
              type="number"
              step="0.5"
              min="40"
              max="90"
              placeholder="Optional"
              className={inputCls(false)}
            />
          </Field>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">
              Photo <span className="text-gray-600 normal-case">(optional, max 5 MB)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className="px-3 py-2 text-xs font-mono bg-navy-800 border border-navy-600/60 rounded-lg text-gray-300 group-hover:border-sand/40 transition-colors">
                Choose Image
              </span>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-10 w-10 object-cover rounded-lg border border-navy-600"
                />
              ) : (
                <span className="text-xs text-gray-600 font-mono">No file chosen</span>
              )}
              <input
                name="photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {/* Notes */}
          <Field label="Notes / Tips" error={errors.notes}>
            <div className="relative">
              <textarea
                name="notes"
                maxLength={500}
                rows={3}
                placeholder="Anything useful for other anglers…"
                className={`${inputCls(!!errors.notes)} resize-none`}
                onChange={(e) => setNoteLen(e.target.value.length)}
              />
              <span
                className={`absolute bottom-2 right-2 text-[10px] font-mono ${
                  noteLen > 450 ? "text-amber-400" : "text-gray-600"
                }`}
              >
                {noteLen}/500
              </span>
            </div>
          </Field>

          {/* Catch & release */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="catchAndRelease"
              type="checkbox"
              value="true"
              className="w-4 h-4 rounded border-navy-600 bg-navy-800 accent-sand"
            />
            <span className="text-sm text-gray-300">
              Catch & Release{" "}
              <span className="text-xs text-gray-500 font-mono">(fish was returned to the water)</span>
            </span>
          </label>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-mono text-gray-400 border border-navy-700/60 hover:border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-sand text-navy-950 hover:bg-sand/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Catch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-sand ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-navy-800/80 border ${
    hasError ? "border-red-500/60" : "border-navy-600/60"
  } rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-sand/50 transition-colors placeholder-gray-600`;
}
