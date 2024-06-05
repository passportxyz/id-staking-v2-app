import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import { useDatastoreConnectionContext } from "../../context/datastoreConnectionContext";
import { useNavigateWithCommonParams } from "@/hooks/hooks_staking/useNavigateWithCommonParams";
import { useChainInitialization } from "@/hooks/staking_hooks/useChainInitialization";
import PageRoot, { PageRootProps } from "./PageRoot";

const LoggedInPageRoot = (props: PageRootProps) => {
  useChainInitialization();
  const { isConnected } = useAccount();
  const { dbAccessTokenStatus } = useDatastoreConnectionContext();
  const navigate = useNavigateWithCommonParams();

  useEffect(() => {
    if (!isConnected || dbAccessTokenStatus !== "connected") {
      navigate("/");
    }
  }, [isConnected, dbAccessTokenStatus, navigate]);

  return <PageRoot {...props} />;
};

export default LoggedInPageRoot;
