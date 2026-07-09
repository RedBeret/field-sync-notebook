import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  label: string;
  onClose: () => void;
  size?: "small" | "medium" | "large";
}

export function Modal({ children, label, onClose, size = "medium" }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-label={label} aria-modal="true" className={`modal modal--${size}`} role="dialog">
        <button aria-label="Close dialog" className="modal-close" onClick={onClose} type="button"><X aria-hidden="true" size={20} /></button>
        {children}
      </section>
    </div>
  );
}
