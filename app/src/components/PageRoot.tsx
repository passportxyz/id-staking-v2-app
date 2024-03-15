import React from "react";
import { Backdrop } from "./components_staking/Backdrop";

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

export default PageRoot;
