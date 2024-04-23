import React, { useCallback } from "react";
import { StakeForOthersHistory } from "./StakeForOthersHistory";
import { StakeForOthersForm } from "./StakeForOthersForm";
import { StakeSection } from "./StakeSection";
import { useCommunityStakeHistoryQuery } from "@/utils/stakeHistory";
import { useAccount } from "wagmi";
import { useSearchParams } from "react-router-dom";

export const StakeForOthers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const presetAddress = searchParams.get("stake_on") || undefined;
  const clearPresetAddress = useCallback(() => {
    searchParams.delete("stake_on");
    setSearchParams(searchParams);
  }, [searchParams]);

  const { address } = useAccount();
  const { data } = useCommunityStakeHistoryQuery(address);

  const stakedAmount: string = data?.reduce((acc, stake) => acc + BigInt(stake.amount), 0n).toString() || "0";

  return (
    <StakeSection
      icon={{
        src: "/assets/multi-person-icon.svg",
        alt: "Person Icon",
      }}
      heading="Stake for Others"
      subheading="Vouch for others' trust by staking GTC on them. It strengthens our community's web of trust."
      amount={stakedAmount}
      initialOpen={!!presetAddress}
    >
      <StakeForOthersForm presetAddress={presetAddress} clearPresetAddress={clearPresetAddress} />
      <StakeForOthersHistory presetAddress={presetAddress} clearPresetAddress={clearPresetAddress} />
    </StakeSection>
  );
};
