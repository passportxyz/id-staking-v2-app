/* eslint-disable react-hooks/exhaustive-deps */
// --- React Methods
import React from "react";

// --Components
import PageRoot from "@/components/components_staking/PageRoot";
import Footer from "../components/components_staking/Footer";
import Header from "../components/Header";
import BodyWrapper from "../components/BodyWrapper";
import HeaderContentFooterGrid from "../components/HeaderContentFooterGrid";

const TosListItem = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <li className="list-disc ml-8">
    {title && <span className="font-bold">{title}: </span>}
    {children}
  </li>
);

const TosLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-color-6 hover:underline">
    {children}
  </a>
);

const ENTRIES = [
  {
    title: "Introduction",
    body: (
      <>
        <p>
          Welcome to Passport.XYZ. By accessing or using Passport, you agree to be bound by these Terms of Service.
          Please read them carefully.
        </p>
        <p>
          These Terms govern your access to and use of the Services. Please read these Terms carefully, as they include
          important information about your legal rights. By accessing and/or using the Services, you are agreeing to
          these Terms. If you do not understand or agree to these Terms, please do not use the Services.
        </p>
      </>
    ),
  },
  {
    title: "Eligibility and Account Registration",
    body: (
      <p>
        Users must be of legal age and capable of forming a binding contract. Account creation will involve identity
        verification processes.
      </p>
    ),
  },
  {
    title: "Prohibited Activities",
    body: (
      <p>
        Engaging in fraudulent activities, violating intellectual property rights, or participating in market
        manipulation is prohibited.
      </p>
    ),
  },
  {
    title: "Technical Knowledge and Risk Acknowledgement",
    body: (
      <>
        <p>
          In using Passport, it&apos;s crucial that users have a foundational understanding of blockchain technology and
          the specific mechanisms we employ, such as staking and slashing, to maintain the integrity and security of the
          ecosystem. To assist with this, we provide access to a variety of resources:
        </p>
        <ul>
          <TosListItem title="Our Open-Source Codebase">
            Explore the technical underpinnings of Passport by visiting our GitHub repository{" "}
            <TosLink href="https://github.com/gitcoinco/id-staking-v2">
              https://github.com/gitcoinco/id-staking-v2
            </TosLink>
            . This resource is invaluable for those wishing to understand the code that powers our platform.
          </TosListItem>
          <TosListItem title="Technical Documentation">
            Technical Documentation: For detailed explanations of the staking and slashing processes, including the
            criteria and scenarios under which slashing may occur, please refer to our comprehensive guides available at{" "}
            <TosLink href="https://github.com/gitcoinco/id-staking-v2/blob/main/README.md">
              https://github.com/gitcoinco/id-staking-v2/blob/main/README.md
            </TosLink>
            .
          </TosListItem>
        </ul>
      </>
    ),
  },
  {
    title: "Transactions and Non-Custodial Nature",
    body: (
      <p>
        All transactions on Passport are user-initiated. Passport is a non-custodial platform, and users are responsible
        for managing their digital assets.
      </p>
    ),
  },
  {
    title: "Compliance with Laws and Tax Obligations",
    body: (
      <p>
        Users are responsible for complying with all applicable laws and tax obligations related to their use of
        Passport.
      </p>
    ),
  },
  {
    title: "Slashing Policy in Anti-Sybil Efforts",
    body: (
      <>
        <p>
          At Passport, maintaining the integrity and fairness of the ecosystem is a paramount concern. Central to this
          commitment is our robust anti-Sybil policy, aimed at preventing reward manipulation and ensuring equitable
          participation for all users. A fundamental aspect of this policy revolves around the use of Passport Stamps:
          each Stamp, regardless of its origin—be it web2 OAuth credentials (such as those from Discord or Google) or
          decentralized identity verifications (like Civic or Holonym)—is to be used exclusively within a single active
          Passport.
        </p>
        <p>
          This policy is designed to deter Sybil attacks, where individuals might try to create multiple identities to
          unfairly skew outcomes or secure undue advantages. By instituting a clear and equitable rule, we stipulate
          that:
        </p>
        <ul>
          <TosListItem>
            Each Stamp, a symbol of identity or affiliation verification, must remain unique to one Passport and cannot
            be reused or shared across multiple Passports.
          </TosListItem>
          <TosListItem>
            This rule is critical in safeguarding the ecosystem against attempts to manipulate the system, ensuring a
            fair and equitable environment for all participants.
          </TosListItem>
        </ul>
        <p>
          Any infringement of this policy, such as the replication of a single Stamp across several Passports, will
          result in &apos;slashing&apos; penalties. These consequences can range from the loss of rewards to a reduction
          in staking benefits or other appropriate punitive measures. Slashing acts as a powerful deterrent against
          actions that compromise the ecosystem’s integrity and fairness.
        </p>
        <p>
          Passport is dedicated to enforcing these rules rigorously, continuously updating our policies to guard against
          new forms of abuse or manipulation. Our aim is not merely to maintain a secure and trustworthy platform but to
          nurture a community where fairness and integrity reign supreme.
        </p>
        <p>
          By participating in the Passport ecosystem, you acknowledge and agree to comply with this policy, fully
          understanding the significance of these measures in protecting the integrity of our community.
        </p>
      </>
    ),
  },
  {
    title: "Intellectual Property Rights",
    body: (
      <p>
        Gitcoin LTD owns all intellectual property rights in Passport. Users agree not to infringe upon these rights.
      </p>
    ),
  },
  {
    title: "Indemnification Clause",
    body: (
      <>
        <p>
          Users of Passport agree to indemnify and hold Passport, its affiliates, officers, agents, employees, and
          partners harmless from any claims, liabilities, damages, losses, and expenses, including without limitation
          reasonable legal and accounting fees, arising out of or in any way connected with:
        </p>
        <ul>
          <TosListItem title="Breach of these Terms">
            Any user actions that breach the Terms of Service, including violations of any representations, warranties,
            or agreements stipulated herein.
          </TosListItem>
          <TosListItem title="Unlawful Use">
            The unlawful use of Passport or any activities conducted with or through Passport that violate any
            applicable laws, regulations, or rights of any third party, including but not limited to intellectual
            property rights.
          </TosListItem>
          <TosListItem title="User Content">
            The content and data provided by users through Passport, including claims related to data accuracy,
            intellectual property infringement, or any harm resulting from user-uploaded content.
          </TosListItem>
          <TosListItem title="Negligence or Misconduct">
            Any acts of negligence, wrongful conduct, or intentional misconduct by users that result in claims or
            damages to any party, including other users of Passport or third parties.
          </TosListItem>
        </ul>
        <p>
          This indemnification responsibility entails that users will cover all costs, damages, and expenses, including
          reasonable attorneys&apos; fees, that arise from claims brought against Gitcoin due to the users’ actions or
          content provided while using Passport. The clause is designed to protect Gitcoin and its ecosystem from
          financial losses and legal implications stemming from users’ activities that fail to comply with the Terms of
          Service or applicable laws.
        </p>
        <p>
          By using Passport, users acknowledge their understanding of these indemnification responsibilities and agree
          to act in a manner that upholds the integrity of the platform, adhering to both the letter and spirit of these
          Terms.
        </p>
      </>
    ),
  },
  {
    title: "Limitation of Liability and Warranty Disclaimer",
    body: (
      <p>
        Passport is provided &apos;as is&apos; without warranties. Passport is not liable for damages arising from the
        use of Passport.
      </p>
    ),
  },
  {
    title: "Amendments to the Terms of Service",
    body: (
      <p>
        Passport reserves the right to modify these Terms at any time and without announcement. Continued use of
        Passport after changes constitutes acceptance of the new Terms.
      </p>
    ),
  },
  {
    title: "Governing Law and Dispute Resolution",
    body: (
      <p>
        These Terms are governed by the British Virgin Islands. Disputes will be resolved through our appeals process,
        which is currently being finalized. Details will be provided once the process is available.
      </p>
    ),
  },
  {
    title: "Termination",
    body: <p>Passport may terminate a user&apos;s access to Passport for breach of these Terms.</p>,
  },
  {
    title: "Contact Information",
    body: (
      <p>
        For questions about these Terms, please contact{" "}
        <a className="underline" href="mailto:support@passport.xyz">
          support@passport.xyz
        </a>{" "}
        and refer to the{" "}
        <a className="underline" href="https://www.gitcoin.co/privacy" target="_blank">
          Privacy Policy
        </a>{" "}
        for further information.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header hideMenu={true} />
        <BodyWrapper className="">
          <h1 className="text-2xl pt-6 pb-2 text-color-6 text-center">TERMS OF SERVICE</h1>
          <p className="text-center">Last Revised April 2024</p>

          {ENTRIES.map((entry, index) => (
            <div key={index}>
              <h2 className="text-xl pt-8 pb-2 text-color-6">
                {index + 1}. {entry.title}
              </h2>
              <div className="text-base/loose space-y-4">{entry.body}</div>
            </div>
          ))}
        </BodyWrapper>
        <Footer />
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
