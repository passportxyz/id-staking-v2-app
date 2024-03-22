/* eslint-disable react-hooks/exhaustive-deps */
// --- React Methods
import React, { useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// --Components
import PageRoot from "@/components/components_staking/PageRoot";
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

export default function Terms() {
  const headerStyle = "text-xl pt-8 pb-4 text-color-6";
  const sectionStyle = "text-base/loose";
  return (
    <PageRoot className="text-color-1">
      <HeaderContentFooterGrid>
        <Header hideMenu={true} />
        <BodyWrapper className="">
          <h1 className="text-2xl pt-6 pb-2 text-color-6 text-center">TERMS OF SERVICE</h1>
          <p className="text-center">Last Revised March 2024</p>

          <h2 className={headerStyle}>1. Introduction</h2>
          <p className={sectionStyle}>
            Welcome to Passport.XYZ by Gitcoin. By accessing or using Passport, you agree to be bound by these Terms of
            Service. Please read them carefully. These Terms govern your access to and use of the Services. Please read
            these Terms carefully, as they include important information about your legal rights. By accessing and/or
            using the Services, you are agreeing to these Terms. If you do not understand or agree to these Terms,
            please do not use the Services.
          </p>
          <h2 className={headerStyle}>2. Eligibility and Account Registration</h2>
          <p className={sectionStyle}>
            Users must be of legal age and capable of forming a binding contract. Account creation will involve identity
            verification processes.
          </p>
          <h2 className={headerStyle}>3. Prohibited Activities</h2>
          <p className={sectionStyle}>
            Engaging in fraudulent activities, violating intellectual property rights, or participating in market
            manipulation is prohibited.
          </p>
          <h2 className={headerStyle}>4. Technical Knowledge and Risk Acknowledgement [CONSIDERATION]</h2>
          <p className={sectionStyle}>
            In using Passport, it&apos;s crucial that users have a foundational understanding of blockchain technology and
            the specific mechanisms we employ, such as staking and slashing, to maintain the integrity and security of
            the ecosystem. To assist with this, we provide access to a variety of resources: Our Open-Source Codebase:
            Explore the technical underpinnings of Passport by visiting our GitHub repository
            https://github.com/gitcoinco/id-staking-v2 https://github.com/gitcoinco/id-staking-v2-app[insert link here].
            This resource is invaluable for those wishing to understand the code that powers our platform. Technical
            Documentation: For detailed explanations of the staking and slashing processes, including the criteria and
            scenarios under which slashing may occur, please refer to our comprehensive guides available at
            https://github.com/gitcoinco/id-staking-v2/blob/main/README.md[insert link to documentation]. Educational
            Content: We offer a series of educational materials aimed at demystifying complex concepts and promoting a
            better understanding of the risks and responsibilities associated with participating in the Passport
            ecosystem. Find these resources on our website at [insert link to educational content].
          </p>
          <h2 className={headerStyle}>5. Transactions and Non-Custodial Nature</h2>
          <p className={sectionStyle}>
            All transactions on Passport are user-initiated. Passport is a non-custodial platform, and users are
            responsible for managing their digital assets.
          </p>
          <h2 className={headerStyle}>6. Compliance with Laws and Tax Obligations</h2>
          <p className={sectionStyle}>
            Users are responsible for complying with all applicable laws and tax obligations related to their use of
            Passport.
          </p>
          <h2 className={headerStyle}>7. Slashing Policy in Anti-Sybil Efforts</h2>
          <p className={sectionStyle}>
            At Passport, maintaining the integrity and fairness of the ecosystem is a paramount concern. Central to this
            commitment is our robust anti-Sybil policy, aimed at preventing reward manipulation and ensuring equitable
            participation for all users. A fundamental aspect of this policy revolves around the use of Passport Stamps:
            each Stamp, regardless of its origin—be it web2 OAuth credentials (such as those from Discord or Google) or
            decentralized identity verifications (like Civic or Holonym)—is to be used exclusively within a single
            active Passport. This policy is designed to deter Sybil attacks, where individuals might try to create
            multiple identities to unfairly skew outcomes or secure undue advantages. By instituting a clear and
            equitable rule, we stipulate that: Each Stamp, a symbol of identity or affiliation verification, must remain
            unique to one Passport and cannot be reused or shared across multiple Passports. This rule is critical in
            safeguarding the ecosystem against attempts to manipulate the system, ensuring a fair and equitable
            environment for all participants. Any infringement of this policy, such as the replication of a single Stamp
            across several Passports, will result in &apos;slashing&apos; penalties. These consequences can range from the loss of
            rewards to a reduction in staking benefits or other appropriate punitive measures. Slashing acts as a
            powerful deterrent against actions that compromise the ecosystem’s integrity and fairness. Passport is
            dedicated to enforcing these rules rigorously, continuously updating our policies to guard against new forms
            of abuse or manipulation. Our aim is not merely to maintain a secure and trustworthy platform but to nurture
            a community where fairness and integrity reign supreme. By participating in the Passport ecosystem, you
            acknowledge and agree to comply with this policy, fully understanding the significance of these measures in
            protecting the integrity of our community.
          </p>
          <h2 className={headerStyle}>8. Third-Party Node Operations [CONSIDERATION]</h2>
          <p className={sectionStyle}>
            If applicable, outline the role and limitations of third-party nodes in the Passport ecosystem.
          </p>
          <h2 className={headerStyle}>9. Intellectual Property Rights</h2>
          <p className={sectionStyle}>
            Passport owns all intellectual property rights in Passport. Users agree not to infringe upon these rights.
          </p>
          <h2 className={headerStyle}>10. Indemnification Clause [CONSIDERATION]</h2>
          <p className={sectionStyle}>
            Users of Passport agree to indemnify and hold Passport, its affiliates, officers, agents, employees, and
            partners harmless from any claims, liabilities, damages, losses, and expenses, including without limitation
            reasonable legal and accounting fees, arising out of or in any way connected with: Breach of these Terms:
            Any user actions that breach the Terms of Service, including violations of any representations, warranties,
            or agreements stipulated herein. Unlawful Use: The unlawful use of Passport or any activities conducted with
            or through Passport that violate any applicable laws, regulations, or rights of any third party, including
            but not limited to intellectual property rights. User Content: The content and data provided by users
            through Passport, including claims related to data accuracy, intellectual property infringement, or any harm
            resulting from user-uploaded content. Negligence or Misconduct: Any acts of negligence, wrongful conduct, or
            intentional misconduct by users that result in claims or damages to any party, including other users of
            Passport or third parties. This indemnification responsibility entails that users will cover all costs,
            damages, and expenses, including reasonable attorneys&apos; fees, that arise from claims brought against Gitcoin
            due to the users’ actions or content provided while using Passport. The clause is designed to protect
            Gitcoin and its ecosystem from financial losses and legal implications stemming from users’ activities that
            fail to comply with the Terms of Service or applicable laws. By using Passport, users acknowledge their
            understanding of these indemnification responsibilities and agree to act in a manner that upholds the
            integrity of the platform, adhering to both the letter and spirit of these Terms.
          </p>
          <h2 className={headerStyle}>11. Limitation of Liability and Warranty Disclaimer</h2>
          <p className={sectionStyle}>
            Passport is provided &apos;as is&apos; without warranties. Passport is not liable for damages arising from the use of
            Passport.
          </p>
          <h2 className={headerStyle}>12. Provisions for Unexpected Events [CONSIDERATION]</h2>
          <p className={sectionStyle}>
            Outline the course of action in case of unexpected technical issues or events affecting Passport.
          </p>
          <h2 className={headerStyle}>13. Amendments to the Terms of Service</h2>
          <p className={sectionStyle}>
            Passport reserves the right to modify these Terms at any time and without announcement. Continueduse of
            Passport after changes constitutes acceptance of the new Terms.
          </p>
          <h2 className={headerStyle}>14. Governing Law and Dispute Resolution</h2>
          <p className={sectionStyle}>
            These Terms are governed by [applicable jurisdiction&apos;s laws]. Disputes will be resolved through our appeals
            process as outlined in Passport’s Identity and Appeals process.
          </p>
          <h2 className={headerStyle}>15. Termination</h2>
          <p className={sectionStyle}>Passport may terminate a user&apos;s access to Passport for breach of these Terms.</p>
          <h2 className={headerStyle}>16. Contact Information</h2>
          <p className={sectionStyle}>
            For questions about these Terms, please contact [Passport contact information] and refer to the Privacy
            Policy for further information.
          </p>
        </BodyWrapper>
      </HeaderContentFooterGrid>
    </PageRoot>
  );
}
