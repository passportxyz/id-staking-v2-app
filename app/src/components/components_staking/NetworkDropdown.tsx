import React, { useMemo, useState } from "react";
import { chainConfigs, ChainConfig } from "@/utils/chains";
import { useBalance } from "wagmi";
import { useWalletStore } from "@/context/walletStore";
import { DropDownIcon } from "./DropDownIcon";
import { useOutsideClick } from "@/utils/helpers";

interface NetworkDropdownProps {
  onSelectChain: (chain: ChainConfig) => void;
  selectedChain: ChainConfig;
}

const ChainMenuItem = ({
  chain,
  isSelected,
  menuIsOpen,
  onMenuOpen,
  onMenuItemSelect,
  className,
}: {
  chain: ChainConfig;
  isSelected: boolean;
  menuIsOpen: boolean;
  onMenuOpen: () => void;
  onMenuItemSelect: () => void;
  className?: string;
}) => {
  const address = useWalletStore((state) => state.address);
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
        className={`h-full text-lg items-center px-4 ${!(isSelected || menuIsOpen) ? "hidden" : "flex"} ${className}`}
      >
        <img src={chain.icon} className="h-6 w-5" />
        <div className="mx-4 grow">GTC Balance </div>
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

export const NetworkDropdown: React.FC<NetworkDropdownProps> = ({ onSelectChain, selectedChain }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setMenuIsOpen(false));

  const nonSelectedChainConfigs = useMemo(
    () => chainConfigs.filter(({ id }) => id !== selectedChain.id),
    [selectedChain.id]
  );

  const sortedChainConfigs = useMemo(
    () => [selectedChain, ...nonSelectedChainConfigs],
    [selectedChain, nonSelectedChainConfigs]
  );

  return (
    <div className="flex justify-end col-span-full">
      <div className="relative h-12 w-full md:w-96" ref={ref}>
        <div
          className={`absolute top-0 left-0 border rounded-lg border-foreground-4 w-full bg-gradient-to-r from-background to-background-6 transition-all ${
            menuIsOpen ? "z-10" : ""
          }`}
        >
          {sortedChainConfigs.map((chain, idx) => (
            <ChainMenuItem
              key={chain.id}
              className={idx ? "border-t border-foreground-4" : ""}
              chain={chain}
              isSelected={!idx}
              menuIsOpen={menuIsOpen}
              onMenuOpen={() => idx || setMenuIsOpen(true)}
              onMenuItemSelect={() => {
                idx && onSelectChain(chain);
                setMenuIsOpen(false);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
