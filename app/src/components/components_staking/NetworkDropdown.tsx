import React, { ChangeEvent, useContext, useState } from "react";
import { Button } from "@/components/Button";
import { Menu } from "@headlessui/react";
import { chainConfigs, ChainConfig } from "@/utils/chains";
import { useBalance } from "wagmi";
import { useWalletStore } from "@/context/walletStore";


const MenuButton = ({ text }: { text: string }) => {
  const [dropDownOpen, setDropDownState] = useState<boolean>(false);
  const handleDropDown = () => {
    setDropDownState(!dropDownOpen);
  };
  return (
    <Menu.Button
      as="div"
      className="grid grid-flow-col grid-cols-2"
      onClick={handleDropDown}
    >
      <div>{text}</div>
      <div
        className={`grid place-items-center ${dropDownOpen ? "transform -rotate-180" : ""
          }`}
      >
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284973 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z"
            fill="#C1F6FF"
          />
        </svg>
      </div>
    </Menu.Button>
  );
};

const MenuItem = ({ chainCfg, key }: { chainCfg: ChainConfig, key: string }) => {
  const address = useWalletStore((state) => state.address);

  const balance = useBalance({
    address: address,
    token: chainCfg.gtcContractAddr,
    chainId: chainCfg.id,
  });
  const calculatedBalance = Number(balance.data?.value || 0) / (10 ** Number(balance.data?.decimals || 1));

  const formattedBalance = calculatedBalance.toLocaleString('en', {
    // Use period as decimal separator
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [selectedChain, setChain] = useState<number>(1);

  const handleChainSelect = (chain: number) => {
    console.log("chain - ", chain);
    setChain(chain); 
  };

  return (
    <Menu.Item key={key}>
      {({ active }) => (
        <button
          className={`${active ? "bg-blue-500" : ""} grid grid-flow-col m-1`}
          onClick={() => handleChainSelect(chainCfg.id)}
        >
          <img className="mx-2" src={chainCfg.icon} />
          {chainCfg.label} {formattedBalance}
        </button>
      )}
    </Menu.Item>
  );
};

export const NetworkDropdown = () => {

  return (
    <div className="col-span-full grid justify-self-end grid-flow-row">
      <Menu>
        <MenuButton text={`Initial Data here`} />
        <Menu.Items as="div" className="grid grid-flow-row">
          {chainConfigs.map((chain, index) => (
            <MenuItem chainCfg={chain} key={index.toString()} />
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
};
