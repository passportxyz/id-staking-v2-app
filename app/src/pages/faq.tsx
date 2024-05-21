/* eslint-disable react-hooks/exhaustive-deps */
// --- React Methods
import React, { useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// --Components
import LoggedInPageRoot from "@/components/components_staking/LoggedInPageRoot";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";

// --Chakra UI Elements
import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import { SubHeader } from "@/components/SubHeader";
import { palette, themes } from "@/utils/theme";
import { LUNARPUNK_DARK_MODE } from "@/utils/theme/themes";

export default function FAQ() {
  return (
    <LoggedInPageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper className="">
          <SubHeader text="FAQ" />
          <Accordion>
            <AccordionItem
              borderTop={0}
              borderBottomColor={LUNARPUNK_DARK_MODE.colors.foreground2}
              borderBottom={"solid"}
            >
              <h2>
                <AccordionButton px={0}>
                  <div className="text-foreground-2 flex text-left">Heading</div>
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} px={0}>
                <p className="text-foreground-2 flex text-left">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat.
                </p>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </LoggedInPageRoot>
  );
}
