// --- React Methods
import React, { useState } from "react";

// --Components
import PageRoot from "../components/PageRoot";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";
import PageWidthGrid from "../components/PageWidthGrid";
import { YourStake } from "../components/components_staking/YourStake";
import { NetworkDropdown } from "../components/components_staking/NetworkDropdown";
import { ChainConfig, chainConfigs } from "@/utils/chains";
import LoggedInPageRoot from "@/components/components_staking/LoggedInPageRoot";

export default function LeaderBoard() {
  const [currentChain, setChain] = useState<ChainConfig>(chainConfigs[0]);

  const handleChainChange = (chain: ChainConfig) => {
    setChain(chain);
  };

  return (
    <LoggedInPageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper>
          <PageWidthGrid>
            <NetworkDropdown onSelectChain={handleChainChange} selectedChain={currentChain} />
            <YourStake selectedChain={currentChain} />
          </PageWidthGrid>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </LoggedInPageRoot>
  );
}
