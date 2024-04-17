import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import { Backdrop } from "./Backdrop";
import { useDatastoreConnectionContext } from "../../context/datastoreConnectionContext";
import { useNavigateWithCommonParams } from "@/hooks/hooks_staking/useNavigateWithCommonParams";

type BackgroundGradientStyle = "top-only" | "top-and-side";

const LoggedInPageRoot = ({
  children,
  className,
  backgroundGradientStyle = "top-and-side",
}: {
  children: React.ReactNode;
  className?: string;
  backgroundGradientStyle?: BackgroundGradientStyle;
}) => {
  const { isConnected } = useAccount();
  const { dbAccessTokenStatus } = useDatastoreConnectionContext();
  const navigate = useNavigateWithCommonParams();

  useEffect(() => {
    if (!isConnected || dbAccessTokenStatus !== "connected") {
      navigate("/");
    }
  }, [isConnected, dbAccessTokenStatus, navigate]);

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

export default LoggedInPageRoot;
