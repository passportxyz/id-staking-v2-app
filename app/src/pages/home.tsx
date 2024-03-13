// --- React Methods
import React from "react";

// --Components
import PageRoot from "../components/PageRoot";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";
import PageWidthGrid from "../components/PageWidthGrid";
import { YourStake } from "../components/components_staking/YourStake";
import { NetworkDropdown } from "../components/components_staking/NetworkDropdown";

export default function LeaderBoard() {
  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper>
          <PageWidthGrid>
            <NetworkDropdown />
            <YourStake />
            {/* This is just here for now to make sure
                everything looks right with multiple sections */}
            <YourStake />
          </PageWidthGrid>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
