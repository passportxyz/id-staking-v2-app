import React from "react";

import { Backdrop } from "./Backdrop";

type BackgroundGradientStyle = "top-only" | "top-and-side";

export type PageRootProps = {
  children: React.ReactNode;
  className?: string;
  backgroundGradientStyle?: BackgroundGradientStyle;
};

const PageRoot = ({ children, className, backgroundGradientStyle = "top-and-side" }: PageRootProps) => {
  return (
    <div className={`bg-background font-body ${className}`}>
      <Backdrop />
      <div className={`bg-radial-gradient-top`}>
        {backgroundGradientStyle === "top-and-side" ? (
          <div className={`bg-radial-gradient-side`}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default PageRoot;
