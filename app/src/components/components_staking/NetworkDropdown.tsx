import React, { useEffect, useMemo, useRef, useState } from "react";
import { chainConfigs, ChainConfig } from "@/utils/chains";
import { useAccount, useBalance } from "wagmi";
import { DropDownIcon } from "./DropDownIcon";
import { useConnectedChain, useOutsideClick } from "@/utils/helpers";
import { useSwitchChain } from "wagmi";

const ChainMenuItem = ({
  chain,
  isSelected,
  menuIsOpen,
  onMenuOpen,
  onMenuItemSelect,
  isPendingWalletApproval,
  className,
}: {
  chain: ChainConfig;
  isSelected: boolean;
  menuIsOpen: boolean;
  onMenuOpen: () => void;
  onMenuItemSelect: () => void;
  isPendingWalletApproval: boolean;
  className?: string;
}) => {
  const { address } = useAccount();
  const balance = useBalance({
    address,
    token: chain.gtcContractAddr,
    chainId: chain.id,
  });

  const calculatedBalance = Number(balance.data?.value || 0) / 10 ** Number(balance.data?.decimals || 1);

  const formattedBalance = calculatedBalance.toLocaleString("en", {
    // Use period as decimal separator
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <div
      className={`${!(isSelected || menuIsOpen) ? "h-0" : "h-10"} transition-all cursor-pointer`}
      onClick={() => (menuIsOpen ? onMenuItemSelect() : onMenuOpen())}
    >
      <div
        className={`h-full text-lg items-center px-4 ${isPendingWalletApproval ? "animate-pulse" : ""} ${
          !(isSelected || menuIsOpen) ? "hidden" : "flex"
        } ${className}`}
      >
        <img src={chain.icon} className="h-6 w-5" />
        <div className="mx-4 grow flex whitespace-nowrap overflow-hidden text-overflow-ellipsis">
          {isPendingWalletApproval ? "Approve in wallet..." : "GTC Balance"}
        </div>
        <img src="/assets/gitcoinLogoGreen.svg" alt="Gitcoin Logo" />
        <div className="mx-2 font-bold">{formattedBalance}</div>
        <DropDownIcon
          isOpen={menuIsOpen}
          className={`mx-1 ${isSelected ? "visible" : "invisible"}`}
          width="10"
          height="8"
        />
      </div>
    </div>
  );
};

export const NetworkDropdown: React.FC = ({}) => {
  const selectedChain = useConnectedChain();
  // Facilitates optimistically updating the chain in the UI, but
  // rolling back if the chain switch fails or is cancelled
  const [tempSelectedChain, setTempSelectedChain] = useState<ChainConfig>(selectedChain);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { switchChainAsync } = useSwitchChain();
  useOutsideClick(ref, () => setMenuIsOpen(false));

  useEffect(() => {
    setTempSelectedChain(selectedChain);
  }, [selectedChain]);

  const nonSelectedChainConfigs = useMemo(
    () => chainConfigs.filter(({ id }) => id !== tempSelectedChain.id),
    [tempSelectedChain.id]
  );

  const sortedChainConfigs = useMemo(
    () => [tempSelectedChain, ...nonSelectedChainConfigs],
    [tempSelectedChain, nonSelectedChainConfigs]
  );

  return (
    <div className="flex justify-end col-span-full grid ">
      <div className="relative h-12 w-full md:w-96" ref={ref}>
        <div
          className={`absolute top-0 left-0 border rounded-lg ease-in-out duration-200 border-foreground-4 opacity-70 
          hover:opacity-100 hover:border-foreground-2 focus:border-foreground-2 focus:opacity-100 
          w-full bg-gradient-to-r from-background to-background-6 transition-all ${menuIsOpen ? "z-10" : ""}`}
        >
          {sortedChainConfigs.map((chain, idx) => (
            <ChainMenuItem
              key={chain.id}
              className={idx ? "border-t border-foreground-4" : ""}
              chain={chain}
              isSelected={!idx}
              menuIsOpen={menuIsOpen}
              onMenuOpen={() => idx || setMenuIsOpen(true)}
              isPendingWalletApproval={tempSelectedChain.id !== selectedChain.id}
              onMenuItemSelect={async () => {
                const oldChain = selectedChain;
                setTempSelectedChain(chain);
                setMenuIsOpen(false);
                if (idx) {
                  try {
                    await switchChainAsync({
                      chainId: chain.id,
                    });
                  } catch (e) {
                    setTempSelectedChain(oldChain);
                  }
                }
              }}
            />
          ))}
        </div>
      </div>
      <span className="justify-self-end text-color-2"> Choose a network above to stake </span>
    </div>
  );
};
