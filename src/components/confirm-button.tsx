"use client";

type ConfirmButtonProps = {
  message: string;
  className?: string;
  children: React.ReactNode;
};

export function ConfirmButton({ message, className, children }: ConfirmButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}