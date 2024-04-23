// --- React Methods
import { makeErrorToastProps } from "@/components/DoneToastContent";
import { useWalletStore } from "@/context/walletStore";
import { useToast } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";

// --Components
import { useSearchParams } from "react-router-dom";

export const useChainInitialization = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Need to use the onboard chain methods here,
  // which viem picks up successfully.
  // The viem methods work well in most scenarios but not all,
  // but maybe we can switch back to those once the
  // wagmi+onboard issues are resolved
  // const { switchChain } = useSwitchChain();
  // const connectedChainId = useChainId();
  const setChain = useWalletStore((state) => state.setChain);
  const connectedChainId = useWalletStore((state) => state.chain);
  const address = useWalletStore((state) => state.address);

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
      if (desiredChainId && desiredChainId !== connectedChainId && address) {
        const success = await setChain(desiredChainId);
        if (!success) {
          toast(
            makeErrorToastProps("Error", "Failed to switch chains. Please switch chains using your wallet provider.")
          );
        }
      }
    })();
  }, [desiredChainId, connectedChainId, address, setChain]);

  // Not using this yet, waiting for feedback on how to handle users on unsupported chains
  // Right now, only the `?chain_id=whatever` query param is supported by the logic above, but
  // it would be easy to add the logic to handle wallets connected to unsupported chains here too,
  // and then the return value here will be useful once UI designs are ready
  const switching = desiredChainId !== connectedChainId;

  return useMemo(() => ({ switching }), [switching]);
};
