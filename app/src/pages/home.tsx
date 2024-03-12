/* eslint-disable react-hooks/exhaustive-deps */
// --- React Methods
import React, { useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// --Components
import PageRoot from "../components/PageRoot";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";

// --Chakra UI Elements
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import PageWidthGrid from "@/components/PageWidthGrid";
import { Stake } from "@/components/components_staking/Stake";
import { Networks } from "@/components/components_staking/Networks";

export default function LeaderBoard() {
  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper className="mt-4 md:mt-6 z-1">
          <PageWidthGrid>
            <Networks></Networks>
            <Stake></Stake>
          </PageWidthGrid>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
