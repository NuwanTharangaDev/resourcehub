type FieldProps = {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, name, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}