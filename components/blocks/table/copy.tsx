"use client";

import { ReactNode } from "react";
import { toast } from "sonner";

interface CopyCellProps {
  text: string;
  children: ReactNode;
}

export default function CopyCell({ text, children }: CopyCellProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch (error) {
      console.error("[CopyCell] Failed to copy:", error);
      toast.error("Copy failed");
    }
  };

  return (
    <div className="cursor-pointer" onClick={handleCopy}>
      {children}
    </div>
  );
}
