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

export default function LeaderBoard() {
  const [currentChain, setChain] = useState<ChainConfig>(chainConfigs[0]);

  const handleChainChange = (chain: ChainConfig) => {
    setChain(chain);
  };

  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper>
          <PageWidthGrid>
            <NetworkDropdown onSelectChain={handleChainChange} />
            <YourStake selectedChain={currentChain}/>
            {/* This is just here for now to make sure
                everything looks right with multiple sections */}
          </PageWidthGrid>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
