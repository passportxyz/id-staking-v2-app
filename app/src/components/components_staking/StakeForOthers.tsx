import React from "react";
import { StakeForOthersHistory } from "./StakeForOthersHistory";
import { StakeForOthersForm } from "./StakeForOthersForm";
import { StakeSection } from "./StakeSection";
import { ChainConfig } from "@/utils/chains";
import { StakeData, useStakeHistoryQuery } from "@/utils/stakeHistory";
import { useAccount } from "wagmi";
import { ChainConfig } from "@/utils/chains";

interface YourStakeProps {
  selectedChain: ChainConfig;
}
export const StakeForOthers: React.FC<YourStakeProps> = ({ selectedChain }) => {
  const { address } = useAccount();
  const { data } = useStakeHistoryQuery(address);
  const yourStakeHistory = data?.filter((stake: StakeData) => {
    return stake.stakee !== address?.toLowerCase();
  });
  const stakedAmount: string = yourStakeHistory
    ? yourStakeHistory.reduce((acc, stake) => acc + BigInt(stake.amount), 0n).toString()
    : "0";

  return (
    <StakeSection
      icon={{
        src: "/assets/multi-person-icon.svg",
        alt: "Person Icon",
      }}
      heading="Stake for Others"
      subheading="Vouch for others' trust by staking GTC on them. It strengthens our community's web of trust."
      amount={stakedAmount}
    >
      <StakeForOthersForm selectedChain={selectedChain} />
      <StakeForOthersHistory />
    </StakeSection>
  );
};
