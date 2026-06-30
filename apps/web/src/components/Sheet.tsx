import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function SheetCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1.5 shadow"
      onClick={onClose}
      aria-label="Đóng"
    >
      <X size={20} />
    </button>
  );
}
