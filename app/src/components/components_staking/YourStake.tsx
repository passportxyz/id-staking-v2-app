import React from "react";
import { YourStakeForm } from "./YourStakeForm";
import { StakeSection } from "./StakeSection";
import { YourStakeHistory } from "./YourStakeHistory";
import { ChainConfig } from "@/utils/chains";

interface YourStakeProps {
  selectedChain: ChainConfig;
}

export const YourStake: React.FC<YourStakeProps> = ({ selectedChain }) => {
  return (
    <StakeSection
      icon={{
        src: "/assets/personIcon.svg",
        alt: "Person Icon",
      }}
      heading="Your Stake"
      subheading="Secure your identity by staking GTC. Higher stakes mean more trust in your passport."
    >
      <YourStakeForm selectedChain={selectedChain} />
      <YourStakeHistory />
    </StakeSection>
  );
};
