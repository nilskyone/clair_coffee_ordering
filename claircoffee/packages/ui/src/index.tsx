import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition";
  const variants: Record<string, string> = {
    primary: "bg-espresso-600 text-white hover:bg-espresso-700",
    secondary: "bg-espresso-100 text-espresso-900 hover:bg-espresso-200",
    ghost: "bg-transparent text-espresso-700 hover:bg-espresso-50"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => (
  <label className="block text-sm text-slate-700">
    {label && <span className="mb-1 block font-medium">{label}</span>}
    <input
      className={`w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-espresso-500 focus:outline-none ${className}`}
      {...props}
    />
  </label>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => (
  <div
    className={`rounded-xl border border-slate-100 bg-white p-4 shadow-card ${className}`}
    {...props}
  />
);

export type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-espresso-900">{title}</h3>
          <button className="text-slate-500" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export type ToastProps = {
  message: string;
  variant?: "success" | "warning" | "error";
};

export const Toast: React.FC<ToastProps> = ({ message, variant = "success" }) => {
  const colors: Record<string, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500"
  };
  return (
    <div className={`${colors[variant]} text-white px-4 py-2 rounded-md shadow-lg text-sm`}>
      {message}
    </div>
  );
};
