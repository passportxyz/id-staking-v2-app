import React, { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { chainConfigs, ChainConfig } from "@/utils/chains";
import { useBalance } from "wagmi";
import { useWalletStore } from "@/context/walletStore";

interface NetworkDropdownProps {
  onSelectChain: (chain: ChainConfig) => void;
}

const MenuButton = ({ balance, icon }: { balance: string; icon: string }) => {
  const [dropDownOpen, setDropDownState] = useState<boolean>(false);
  const handleDropDown = () => {
    setDropDownState(!dropDownOpen);
  };
  return (
    <Menu.Button
      as="div"
      className="grid grid-flow-col place-content-between  border rounded-lg  border-foreground-4  bg-gradient-to-r  from-background to-background-6"
      onClick={handleDropDown}
    >
      <div className="m-2">
        <img src={icon} />
      </div>
      <div className="m-2">GTC Balance </div>
      <div className="m-2">
        <img className="pt-1" src="/assets/gitcoinLogoGreen.svg" alt="Gitcoin Logo" />
      </div>
      <div className="m-2">{balance}</div>

      <div
        className={`m-2 grid place-content-around
          ${dropDownOpen ? "transform -rotate-180" : ""}`}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284973 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z"
            fill="#C1F6FF"
          />
        </svg>
      </div>
    </Menu.Button>
  );
};

export const NetworkDropdown: React.FC<NetworkDropdownProps> = ({ onSelectChain }) => {
  const [selectedChain, setChain] = useState<ChainConfig>(chainConfigs[0]);

  const handleChainSelect = (chain: ChainConfig) => {
    setChain(chain);
    onSelectChain(chain);
  };

  const address = useWalletStore((state) => state.address);

  const balance = useBalance({
    address: address,
    token: selectedChain.gtcContractAddr,
    chainId: selectedChain.id,
  });
  const calculatedBalance = Number(balance.data?.value || 0) / 10 ** Number(balance.data?.decimals || 1);

  const formattedBalance = calculatedBalance.toLocaleString("en", {
    // Use period as decimal separator
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="col-span-full grid justify-self-end grid-flow-row">
      <Menu>
        <MenuButton balance={formattedBalance} icon={selectedChain.icon} />
        <Menu.Items as="div" className="grid grid-flow-row">
          {chainConfigs.map((chain, index) => (
            <Menu.Item key={index}>
              {({ active }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const address = useWalletStore((state) => state.address);

                // eslint-disable-next-line react-hooks/rules-of-hooks
                const balance = useBalance({
                  address: address,
                  token: chain.gtcContractAddr,
                  chainId: chain.id,
                });
                const calculatedBalance = Number(balance.data?.value || 0) / 10 ** Number(balance.data?.decimals || 1);

                const formattedBalance = calculatedBalance.toLocaleString("en", {
                  // Use period as decimal separator
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(() => {
                  if (active == true) {
                    setChain(chain);
                  }
                }, [chain, active]);

                return (
                  <button
                    className={` rounded-lg bg-gradient-to-r  from-background to-background-6 place-content-between max-h-30px ${
                      active ? "bg-blue-500" : ""
                    } grid grid-flow-col m-1`}
                    onClick={() => handleChainSelect(chain)}
                  >
                    <div className="m-2">
                      <img src={chain.icon} />
                    </div>
                    <div className="m-2">GTC Balance </div>
                    <div className="m-2">
                      <img className="pt-1" src="/assets/gitcoinLogoGreen.svg" alt="Gitcoin Logo" />
                    </div>
                    <div className="m-2">{formattedBalance}</div>
                  </button>
                );
              }}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
};
