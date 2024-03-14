import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";

export const YourStakeForm = ({}: any) => {
  const [inputValue, setInputValue] = useState<string>("Input a custom amount or choose one from below");
  const [lockedPeriod, setLockedPeriodState] = useState<string>("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddFixedValue = (value: number) => {
    setInputValue(value.toString());
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value.toString());
  };

  const handleStake = () => {
    // TODO:
    console.log("inputValue - ", inputValue);
    console.log("lockedPeriod - ", lockedPeriod);
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelDiv className="grid gap-4 grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <input
          className="col-end-[-1] grow col-start-2  rounded-lg border border-foreground-4 bg-black text-s text-color-2  "
          type="number"
          value={inputValue}
          onChange={handleInputChange}
        />
        <div className="flex gap-2 col-start-2 col-span-3 text-color-4">
          <button className="w-16 rounded-lg bg-background-7" onClick={() => handleAddFixedValue(5)}>
          5
          </button>
          <button className="w-16 rounded-lg bg-background-7" onClick={() => handleAddFixedValue(20)}>
            20
          </button>
          <button className="w-16 rounded-lg bg-background-7" onClick={() => handleAddFixedValue(125)}>
            125
          </button>
        </div>
        <div className="flex col-span-3 text-sm gap-2 justify-self-end">
          <div className="mx-1 text-right font-bold">
            Lockup
            <br />
            period
          </div>
          <Button className="text-sm" onClick={() => handleLockedPeriod(3)}>
            3 months
          </Button>
          <Button className="text-sm" onClick={() => handleLockedPeriod(6)}>
            6 months
          </Button>
          <Button className="text-sm" onClick={() => handleLockedPeriod(12)}>
            12 months
          </Button>
        </div>
      </PanelDiv>
      <Button className="w-full font-bold" onClick={() => handleStake()}>
        Stake
      </Button>
    </div>
  );
};
