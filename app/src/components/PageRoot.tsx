import React from "react";

type BackgroundGradientStyle = "top-only" | "top-and-side";

const PageRoot = ({
  children,
  className,
  backgroundGradientStyle = "top-and-side",
}: {
  children: React.ReactNode;
  className?: string;
  backgroundGradientStyle?: BackgroundGradientStyle;
}) => (
  <div className={`bg-background font-body ${className}`}>
    <div className={`bg-radial-gradient-top`}>
      {backgroundGradientStyle === "top-and-side" ? (
        <div className={`bg-radial-gradient-side`}>{children}</div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default PageRoot;
