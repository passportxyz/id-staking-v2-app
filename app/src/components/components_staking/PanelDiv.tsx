import React from "react";

export const PanelDiv = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`w-full rounded-lg border border-foreground-4 bg-gradient-to-b from-background to-background-5 ${className}`}
  >
    {children}
  </div>
);
