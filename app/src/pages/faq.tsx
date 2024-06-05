/* eslint-disable react-hooks/exhaustive-deps */
// --- React Methods
import React from "react";

// --Components
import PageRoot from "@/components/components_staking/PageRoot";
import Footer from "../components/components_staking/Footer";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";

import { SubHeader } from "@/components/SubHeader";

import { Disclosure } from "@headlessui/react";
import { useAccount } from "wagmi";

const ENTRIES = [
  {
    title: "What is Passport's Identity Staking?",
    body: (
      <p>
        Identity Staking is a feature within the Passport app that allows users to stake GTC tokens to verify their
        human identity. This initiative aims to deter Sybil attacks, enhance the utility of the Passport, and promote a
        more secure and trustworthy web3 ecosystem by developing an onchain trust graph.
      </p>
    ),
  },
  {
    title: "How does Identity Staking work?",
    body: (
      <p>
        Users can stake GTC tokens on their own identity or other trusted individuals within the Passport app. Staking
        GTC acts as a trust signal, supporting the integrity of the web3 community by making it harder for malicious
        actors to create fake identities or engage in Sybil attacks.
      </p>
    ),
  },
  {
    title: "Why should I stake GTC on my identity?",
    body: (
      <p>
        Staking GTC on your identity or other trusted individuals increases your Passport score, which can unlock
        additional benefits and opportunities within the{" "}
        <a href="https://www.passport.xyz/ecosystem" target="_blank">
          Passport ecosystem
        </a>{" "}
        and beyond. It&apos;s a way to verify your commitment to being a genuine participant in web3 spaces.
      </p>
    ),
  },
  {
    title: "What is slashing?",
    body: (
      <p>
        Slashing is an automated penalty mechanism that confiscates and eventually burns the staked GTC of users who
        violate Passport’s trust protocols. This process helps maintain the community&apos;s integrity by deterring
        malicious behaviors.
      </p>
    ),
  },
  {
    title: "What triggers slashing?",
    body: (
      <p>
        Slashing can be triggered by behaviors that compromise the trustworthiness of the{" "}
        <a href="https://www.passport.xyz/ecosystem" target="_blank">
          Passport ecosystem
        </a>
        , such as participating in Sybil attacks or other fraudulent activities.
      </p>
    ),
  },
  {
    title: "What is the Onchain Trust Graph?",
    body: (
      <p>
        The Onchain Trust Graph is a decentralized network that connects verified humans within the web3 ecosystem. It
        helps prevent fake identities, encourages community engagement, and supports decentralized governance.
      </p>
    ),
  },
  {
    title: "What happens if I'm mistakenly identified as a bot or bad actor?",
    body: (
      <p>
        If your staked GTC is slashed due to a mistaken identity as a bot or bad actor, you have a 90-day appeal
        process. During this period, the slashed GTC is locked, and you can follow a dedicated appeal link to present
        your case for reclaiming your staked tokens.
      </p>
    ),
  },
  {
    title: "How can I appeal a slashing decision?",
    body: (
      <p>
        If your GTC has been slashed, you can appeal the decision within a three-month window. Your staked GTC will be
        locked during this period, and you can initiate the appeals process through a dedicated link provided by
        Passport.
      </p>
    ),
  },
  {
    title: "How do I get GTC to stake on my identity?",
    body: (
      <p>
        GTC can be acquired from various exchanges. Websites like{" "}
        <a href="https://coinmarketcap.com/currencies/gitcoin/" target="_blank">
          CoinMarketCap
        </a>{" "}
        offer lists of exchanges where GTC is available. For newcomers, educational resources such as{" "}
        <a href="https://app.banklessacademy.com/lessons" target="_blank">
          Bankless Academy
        </a>{" "}
        can provide valuable insights into navigating the web3 space.
      </p>
    ),
  },
  {
    title: "How much GTC do I need to stake?",
    body: (
      <p>
        There is no minimum requirement for staking GTC on your identity or your friends&apos;. However, the more GTC
        you stake, the higher your Passport score.
      </p>
    ),
  },
  {
    title: "Is there a cost-free way to participate in Identity Staking?",
    body: (
      <p>
        While Identity Staking involves certain costs, such as purchasing GTC and gas fees, there are other ways to
        improve your Passport score without financial investment. Keeping an eye on Passport&apos;s social media for
        events and opportunities is a good strategy.
      </p>
    ),
  },
  {
    title: "What is the appeal process for slashed GTC?",
    body: (
      <p>
        Slashed GTC will be locked for a three-month period, during which the owner can appeal the slashing decision.
        This process is designed to ensure fairness and allow users to contest mistaken identities or wrongful slashing.
      </p>
    ),
  },
  {
    title: "How will the appeals process work?",
    body: (
      <p>
        Details on the appeals process, including the dedicated link for submissions, will be provided to affected
        users. This process is part of our commitment to transparency and fairness in the Identity Staking ecosystem.
      </p>
    ),
  },
  {
    title: "What's next for Identity Staking?",
    body: (
      <p>
        We are continuously working to enhance the Identity Staking feature, including refining the slashing mechanism
        and expanding the Onchain Trust Graph. Stay tuned for updates on new features and improvements.
      </p>
    ),
  },
];

export default function FAQ() {
  const { isConnected } = useAccount();

  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header hideAccountCenter={!isConnected} />
        <BodyWrapper className="mb-20">
          <SubHeader text="FAQ" />
          {ENTRIES.map((entry, index) => (
            <Disclosure key={index} as="div" className="py-4 border-b border-foreground-4 faq">
              <Disclosure.Button className="group text-foreground-2 flex text-left">{entry.title}</Disclosure.Button>
              <Disclosure.Panel className="mt-2 text-foreground-1 flex text-left">{entry.body}</Disclosure.Panel>
            </Disclosure>
          ))}
        </BodyWrapper>
        <Footer />
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
