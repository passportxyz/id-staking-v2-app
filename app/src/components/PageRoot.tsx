import React from "react";

const PageRoot = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-background font-body ${className}`}>
    <div className={`bg-radial-gradient bg-top`}>{children}</div>
  </div>
);

export default PageRoot;
