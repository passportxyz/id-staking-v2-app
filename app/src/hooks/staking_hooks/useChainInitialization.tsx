// --- React Methods
import { makeErrorToastProps } from "@/components/DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";

// --Components
import { useSearchParams } from "react-router-dom";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

// Just returns true/false indicating if
// the connected chain still hasn't been
// switched to the desired chain for the
// ?chain_id= query param
export const useChainInitializing = (): boolean => {
  const [searchParams] = useSearchParams();
  return Boolean(searchParams.get("chain_id"));
};

export const useChainInitialization = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const alreadyRunning = useRef<boolean>(false);

  const { switchChainAsync } = useSwitchChain();
  const connectedChainId = useChainId();
  const { isConnected } = useAccount();

  const toast = useToast();

  const desiredChainId = parseInt(searchParams.get("chain_id") || "");

  useEffect(() => {
    if (desiredChainId && desiredChainId === connectedChainId) {
      searchParams.delete("chain_id");
      setSearchParams(searchParams);
    }
  }, [desiredChainId, connectedChainId, searchParams, setSearchParams]);

  useEffect(() => {
    (async () => {
      if (desiredChainId && !alreadyRunning.current && desiredChainId !== connectedChainId && isConnected) {
        alreadyRunning.current = true;
        try {
          await switchChainAsync({ chainId: desiredChainId });
        } catch (e) {
          console.error("Failed to switch chains", e);
          toast(
            makeErrorToastProps("Error", "Failed to switch chains. Please switch chains using your wallet provider.")
          );
        }
        alreadyRunning.current = false;
      }
    })();
  }, [desiredChainId, connectedChainId, isConnected, switchChainAsync, toast]);

  return useMemo(() => ({ initializing: Boolean(desiredChainId) }), [desiredChainId]);
};
