import React, { ChangeEvent, useContext, useState } from "react";
import { Button } from "@/components/Button";
import { Menu } from '@headlessui/react';
import { chainConfigs, ChainConfig } from "@/utils/chains";
import { useBalance } from 'wagmi'


const MenuButton = ({
  text
}: {
  text: string
}) => {

  const [dropDownOpen, setDropDownState] = useState<boolean>(false);
  const handleDropDown = () => {
    setDropDownState(!dropDownOpen);
  }
  return (
    <Menu.Button as="div" className="grid grid-flow-col grid-cols-2" onClick={handleDropDown}>
      <div>{text}</div>
      <div className={`grid place-items-center ${dropDownOpen ? 'transform -rotate-180' : ''}`}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284973 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z" fill="#C1F6FF" />
        </svg>
      </div>
    </Menu.Button>
  )
}


const MenuItem = ({chainCfg }:{chainCfg : ChainConfig}) => {


  const balance = useBalance({
    address: chainCfg.gtcContractAddr,
    chainId: chainCfg.id
  });

  const [chain, setChain] = useState<number>(1);

  const handleChainSelect = (chain: number) => {
    console.log('chain - ', chain)
    setChain(chain); // TODO: ...
  }

  return ( 
    <Menu.Item>
      {({ active }) => (
        <button className={`${active ? 'bg-blue-500' : ''} grid grid-flow-col m-1`} onClick={() => handleChainSelect(chainCfg.id)}>
          <img className="mx-2" src={chainCfg.icon} />
          {chainCfg.label} {balance.data?.value.toString()}
        </button>
      )}
     </Menu.Item>  
  )
    
}

export const NetworkDropdown = () => {

  const [chain, setChain] = useState<string>('');
  
  // const result = useBalance({
  //   address: '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f',
  //   chainId: chainId
  // });

  // const getBalance = (id: string) => {
  //   return useBalance({
  //       address: '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f',
  //       chainId: chainId
  //   });
  // }
  // const handleChainSelect = (chain: string) => {
  //   console.log('chain - ', chain)
  //   setChain(chain); // TODO: ...
  // }
  return (
    <div className="col-span-full grid justify-self-end grid-flow-row">
      <Menu>
        <MenuButton text={chain}/>
        <Menu.Items as="div" className="grid grid-flow-row">
          {chainConfigs.map((chain, index) => (
            <MenuItem chainCfg={chain} />
            // <Menu.Item key={index}>
            //   {({ active }) => (
            //     <button className={`${active ? 'bg-blue-500' : ''} grid grid-flow-col m-1`} onClick={setChain(chain.label)}>
            //       <img className="mx-2" src={chain.icon} />
            //       {chain.label} {getBalance(chain.id)}
            //     </button>
            //   )}
            // </Menu.Item>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
};




