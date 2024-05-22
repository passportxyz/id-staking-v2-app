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
import parse from "html-react-parser";

const faqs = [
  {
    heading: "What is Passport's Identity Staking?",
    document:
      "Identity Staking is a feature within the Passport app that allows users to stake GTC tokens to verify their human identity. This initiative aims to deter Sybil attacks, enhance the utility of the Passport, and promote a more secure and trustworthy web3 ecosystem by developing an onchain trust graph.",
  },
  {
    heading: "How does Identity Staking work?",
    document:
      "Users can stake GTC tokens on their own identity or other trusted individuals within the Passport app. Staking GTC acts as a trust signal, supporting the integrity of the web3 community by making it harder for malicious actors to create fake identities or engage in Sybil attacks.",
  },
  {
    heading: "Why should I stake GTC on my identity?",
    document:
      '<p>Staking GTC on your identity or other trusted individuals increases your Passport score, which can unlock additional benefits and opportunities within the <a href="https://www.passport.xyz/ecosystem" target="_blank">Passport ecosystem</a> and beyond. It\'s a way to verify your commitment to being a genuine participant in web3 spaces.</p>',
  },
  {
    heading: "What is slashing?",
    document:
      "Slashing is an automated penalty mechanism that confiscates and eventually burns the staked GTC of users who violate Passport’s trust protocols. This process helps maintain the community's integrity by deterring malicious behaviors.",
  },
  {
    heading: "What triggers slashing?",
    document:
      '<p>Slashing can be triggered by behaviors that compromise the trustworthiness of the <a href="https://www.passport.xyz/ecosystem" target="_blank">Passport ecosystem</a>, such as participating in Sybil attacks or other fraudulent activities.</p>',
  },
  {
    heading: "What is the Onchain Trust Graph?",
    document:
      "The Onchain Trust Graph is a decentralized network that connects verified humans within the web3 ecosystem. It helps prevent fake identities, encourages community engagement, and supports decentralized governance.",
  },
  {
    heading: "What happens if I'm mistakenly identified as a bot or bad actor?",
    document:
      "If your staked GTC is slashed due to a mistaken identity as a bot or bad actor, you have a 90-day appeal process. During this period, the slashed GTC is locked, and you can follow a dedicated appeal link to present your case for reclaiming your staked tokens.",
  },
  {
    heading: "How can I appeal a slashing decision?",
    document:
      "If your GTC has been slashed, you can appeal the decision within a three-month window. Your staked GTC will be locked during this period, and you can initiate the appeals process through a dedicated link provided by Passport.",
  },
  {
    heading: "How do I get GTC to stake on my identity?",
    document:
      '<p>GTC can be acquired from various exchanges. Websites like <a href="https://coinmarketcap.com/currencies/gitcoin/" target="_blank">CoinMarketCap</a> offer lists of exchanges where GTC is available. For newcomers, educational resources such as <a href="https://app.banklessacademy.com/lessons" target="_blank">Bankless Academy</a> can provide valuable insights into navigating the web3 space.</p>',
  },
  {
    heading: "How much GTC do I need to stake?",
    document:
      "There is no minimum requirement for staking GTC on your identity or your friends'. However, the more GTC you stake, the higher your Passport score.",
  },
  {
    heading: "Is there a cost-free way to participate in Identity Staking?",
    document:
      "While Identity Staking involves certain costs, such as purchasing GTC and gas fees, there are other ways to improve your Passport score without financial investment. Keeping an eye on Passport's social media for events and opportunities is a good strategy.",
  },
  {
    heading: "What is the appeal process for slashed GTC?",
    document:
      "Slashed GTC will be locked for a three-month period, during which the owner can appeal the slashing decision. This process is designed to ensure fairness and allow users to contest mistaken identities or wrongful slashing.",
  },
  {
    heading: "How will the appeals process work?",
    document:
      "Details on the appeals process, including the dedicated link for submissions, will be provided to affected users. This process is part of our commitment to transparency and fairness in the Identity Staking ecosystem.",
  },
  {
    heading: "What's next for Identity Staking?",
    document:
      "We are continuously working to enhance the Identity Staking feature, including refining the slashing mechanism and expanding the Onchain Trust Graph. Stay tuned for updates on new features and improvements.",
  },
];

export default function FAQ() {
  return (
    <LoggedInPageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header />
        <BodyWrapper className="">
          <SubHeader text="FAQ" />
          <Accordion allowMultiple>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} border={0} marginTop={2}>
                <h2>
                  <AccordionButton px={0}>
                    <div className="text-foreground-2 flex text-left">{faq.heading}</div>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={0}>
                  <div className="text-foreground-2 flex text-left">{parse(faq.document)}</div>
                </AccordionPanel>
                <hr className="border-foreground-4 mt-2" />
              </AccordionItem>
            ))}
          </Accordion>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </LoggedInPageRoot>
  );
}
