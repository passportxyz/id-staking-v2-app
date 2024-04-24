// --- React Methods
import { makeErrorToastProps } from "@/components/DoneToastContent";
import { useWalletStore } from "@/context/walletStore";
import { useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";

// --Components
import { useSearchParams } from "react-router-dom";
import { useChainId } from "wagmi";

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

  // For now, need to use the onboard chain methods here,
  // which viem picks up successfully.
  // The viem methods work well in most scenarios but not all,
  // TODO we should switch back to those once the
  // wagmi+onboard issues are resolved
  // const { switchChain } = useSwitchChain();
  const setChain = useWalletStore((state) => state.setChain);
  const connectedChainId = useWalletStore((state) => state.chain);
  // Use this so we can wait until everything is in sync
  const wagmiConnectedChainId = useChainId();
  const address = useWalletStore((state) => state.address);

  const toast = useToast();

  const desiredChainId = parseInt(searchParams.get("chain_id") || "");

  useEffect(() => {
    if (desiredChainId && desiredChainId === connectedChainId && desiredChainId === wagmiConnectedChainId) {
      searchParams.delete("chain_id");
      setSearchParams(searchParams);
    }
  }, [desiredChainId, connectedChainId, searchParams, setSearchParams, wagmiConnectedChainId]);

  useEffect(() => {
    (async () => {
      if (desiredChainId && !alreadyRunning.current && desiredChainId !== connectedChainId && address) {
        alreadyRunning.current = true;
        const success = await setChain(desiredChainId);
        if (!success) {
          toast(
            makeErrorToastProps("Error", "Failed to switch chains. Please switch chains using your wallet provider.")
          );
        }
        alreadyRunning.current = false;
      }
    })();
  }, [desiredChainId, connectedChainId, address, setChain, toast]);

  return useMemo(() => ({ initializing: Boolean(desiredChainId) }), [desiredChainId]);
};
