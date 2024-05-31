// --- React Methods
import React from "react";

// --Components
import Header from "../components/Header";
import Footer from "../components/components_staking/Footer";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";
import PageWidthGrid from "../components/PageWidthGrid";
import { YourStake } from "../components/components_staking/YourStake";
import { StakeForOthers } from "../components/components_staking/StakeForOthers";
import { TrustInYou } from "@/components/components_staking/TrustInYou";
import { NetworkDropdown } from "../components/components_staking/NetworkDropdown";
import LoggedInPageRoot from "@/components/components_staking/LoggedInPageRoot";

export default function Home() {
  return (
    <LoggedInPageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper>
          <PageWidthGrid>
            <NetworkDropdown />
            <YourStake />
            <StakeForOthers />
            <TrustInYou />
          </PageWidthGrid>
        </BodyWrapper>
        <Footer />
      </HeaderContentFooterGrid>
    </LoggedInPageRoot>
  );
}
