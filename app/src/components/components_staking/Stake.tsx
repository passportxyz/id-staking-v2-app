import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Disclosure } from '@headlessui/react';

const svgDropDownIcon = (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.26795 0.999997C6.03775 -0.333336 7.96225 -0.333333 8.73205 1L13.0622 8.5C13.832 9.83334 12.8697 11.5 11.3301 11.5L2.66987 11.5C1.13027 11.5 0.168022 9.83333 0.937822 8.5L5.26795 0.999997Z" fill="#C1F6FF" />
    </svg>
)
export const Stake = ({ }: any) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [dropDownOpen, setDropDownState] = useState<boolean>(false); // 

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleAddIncrement = (increment: number) => {
        setInputValue(increment.toString());
    };

    const handleDropDown = (event: ChangeEvent<HTMLInputElement>) => {
        setDropDownState(!dropDownOpen);
    }

    return (
        
        <Disclosure>
            <Disclosure.Button className={`col-span-full grid flex rounded border border-foreground-3 bg-gradient-to-b from-background to-background-4`} onClick={handleDropDown}>
                <div className={`col-span-full grid rounded border border-foreground-3 bg-gradient-to-b from-background to-background-4`} >
                    <div className="grid col-span-full grid-flow-col ">
                        <div className="flex border-1 top-0">
                            <img alt="Person Icon" className="max-w-11 m-2" src="/assets/personIcon.svg" />
                            <div className="items-start">
                                <div className="text-2xl text-color-6 md:text-xl lg:text-2xl text-left">Your Stake</div>
                                <div className="text-sm  text-left m-1 text-pretty">Secure your identity by staking GTC. Higher stakes mean more trust in your passport.</div>
                            </div>
                        </div>
                        <div className="grid justify-self-end grid-flow-col ">
                            <div className="text-m mr-2 justify-self-end grid-flow-col ">
                                <div className="my-2 text-right">0 GTC</div>
                                <div className="my-2 text-right">Staked</div>
                            </div>
                     
                            <div className={`p-4 justify-self-end ${dropDownOpen? 'transform -rotate-180' : ''}`} >
                                {svgDropDownIcon}
                                {/* <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.26795 0.999997C6.03775 -0.333336 7.96225 -0.333333 8.73205 1L13.0622 8.5C13.832 9.83334 12.8697 11.5 11.3301 11.5L2.66987 11.5C1.13027 11.5 0.168022 9.83333 0.937822 8.5L5.26795 0.999997Z" fill="#C1F6FF"/>
                        </svg> */}
                            </div>
                        </div>
                    </div>
                </div>
            </Disclosure.Button>

            <Disclosure.Panel className={`col-span-full grid flex `}>
                <div className={`col-span-full grid flex grid-flow-col rounded border border-foreground-3 bg-gradient-to-b from-background to-background-4`} >
                    <div className="m-2 mx-8 text-color-6 text-m  ">Amount</div>
                    <div className="m-2 grid-flow-row grid " >
                        <input className="m-2 mr-1 bg-gradient-to-t from-background-4 via-foreground-3 to-background-4"  type="number" value={inputValue} onChange={handleInputChange} />
                        <div className="grid-flow-col grid  place-content-between">
                            <div className="grid-flow-col grid w-6/12 justify-self-start">
                                <div className="text-sm"><Button className="mx-1 text-sm" onClick={() => handleAddIncrement(5)} >5</Button></div>
                                <div className="text-sm"><Button className="mx-1 text-sm" onClick={() => handleAddIncrement(20)}>20</Button></div>
                                <div className="text-sm"><Button className="mx-1 text-sm" onClick={() => handleAddIncrement(125)}>125</Button></div>
                            </div>
                            <div className="mr-20 flex grid-flow-col grid w-6/12 justify-self-end h-8">
                                <div className="text-xs mx-1">Lockup period</div>
                                <div className="text-xs h-8"><Button className="mx-1 text-xs h-8">3 months</Button></div>
                                <div className="text-xs h-8"><Button className="mx-1 text-xs h-8">6 months</Button></div>
                                <div className="text-xs h-8"><Button className="mx-1 text-xs h-8">12 months</Button></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-full grid flex my-2">
                    <Button className="col-span-full  max-w-full flex">Stake</Button>
                </div>
            </Disclosure.Panel>


        </Disclosure>
    );
};
