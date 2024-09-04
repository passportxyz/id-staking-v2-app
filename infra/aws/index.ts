import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as op from "@1password/op-js";
import { secretsManager } from "infra-libs";

const stack = pulumi.getStack();

const defaultTags = {
  ManagedBy: "pulumi",
  PulumiStack: stack,
  Project: "id-staking-v2",
};

const stakingBranches = Object({
  review: "main",
  staging: "staging-app",
  production: "production-app",
});

const amplifyStage = Object({
  review: "DEVELOPMENT",
  staging: "BETA",
  production: "PRODUCTION",
});
const prefix = "stake";

const coreInfraStack = new pulumi.StackReference(
  `passportxyz/core-infra/${stack}`
);
const passportXYZDomain = coreInfraStack.getOutput("newPassportDomain");

// Get STAKING_APP_GITHUB_URL Variables
const APP_GITHUB_URL = op.read.parse(
  // TODO: this should be moved to id-staking-v2-${stack}-env/ci/STAKING_APP_GITHUB_URL
  `op://DevOps/passport-${stack}-env/ci-staking/STAKING_APP_GITHUB_URL`
);

// CLOUDFLARE_DOMAIN & CLOUDFLARE_ZONE_ID are only required for production
const CLOUDFLARE_DOMAIN = stack === "production" ? `passport.xyz` : "";
const CLOUDFLARE_ZONE_ID = op.read.parse(
  // TODO: this should be moved to id-staking-v2-${stack}-env/ci/CLOUDFLARE_ZONE_ID
  `op://DevOps/passport-${stack}-env/ci/CLOUDFLARE_ZONE_ID`
);

const stakingEnvironment = secretsManager
  .getEnvironmentVars({
    vault: "DevOps",
    repo: "passport", // TODO: this should be moved to id-staking-v2
    env: stack,
    section: "staking", // TODO: this section should be `app` ?
  })
  .reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as Record<string, string | pulumi.Output<any>>);

passportXYZDomain.apply((domainName) => {
  const name = `${prefix}.${domainName}`;

  const amplifyApp = new aws.amplify.App(
    name,
    {
      name: name,
      repository: APP_GITHUB_URL,
      platform: "WEB_COMPUTE",
      buildSpec: `version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - yarn install
        build:
          commands:
            - yarn run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - .next/cache/**/*
          - node_modules/**/*
    appRoot: app
  `,
      customRules: [
        {
          source: "/<*>",
          status: "404",
          target: "/index.html",
        },
      ],
      environmentVariables: {
        AMPLIFY_DIFF_DEPLOY: "false",
        AMPLIFY_MONOREPO_APP_ROOT: "app",
        ...stakingEnvironment,
      },
      tags: {
        Name: name,
        ...defaultTags,
      },
    },
    { protect: true }
  );

  const branch = new aws.amplify.Branch(`${name}-${stakingBranches[stack]}`, {
    appId: amplifyApp.id,
    branchName: stakingBranches[stack],
    displayName: stakingBranches[stack],
    // stage: amplifyStage[stack],
    ttl: "5",
  });

  const webHook = new aws.amplify.Webhook(`${name}-${stakingBranches[stack]}`, {
    appId: amplifyApp.id,
    branchName: stakingBranches[stack],
    description: `trigger build from branch ${stakingBranches[stack]}`,
  });

  const domainAssociation = new aws.amplify.DomainAssociation(name, {
    appId: amplifyApp.id,
    domainName: domainName,
    subDomains: [
      {
        branchName: branch.branchName,
        prefix: prefix,
      },
    ],
  });

  if (CLOUDFLARE_DOMAIN != "") {
    // Handle custom / additional domain assotiation
    const cloudFlareDomainAssociation = new aws.amplify.DomainAssociation(
      `cloudflare-${name}`,
      {
        appId: amplifyApp.id,
        domainName: CLOUDFLARE_DOMAIN,
        waitForVerification: false,
        subDomains: [
          {
            branchName: branch.branchName,
            prefix: prefix,
          },
        ],
      }
    );
    const domainCert =
      cloudFlareDomainAssociation.certificateVerificationDnsRecord;

    // Manage CloudFlare  Records
    const certRecord = domainCert.apply((_cert) => {
      const certDetails = _cert.split(" "); // Name Type Value
      const certRecord = new cloudflare.Record(
        "cloudflare-certificate-record",
        {
          name: certDetails[0].replace(`.${CLOUDFLARE_DOMAIN}.`, ""), // remove the autocomplete domain
          zoneId: CLOUDFLARE_ZONE_ID,
          type: certDetails[1],
          value: certDetails[2],
          allowOverwrite: true,
          comment: `Certificate for *.${CLOUDFLARE_DOMAIN}`,
          // ttl: 3600
        }
      );
      return certRecord;
    });

    cloudFlareDomainAssociation.subDomains.apply((_subDomains) => {
      _subDomains.map((_subD) => {
        const domainDetails = _subD.dnsRecord.split(" "); // Name Type Value
        const record = new cloudflare.Record(`${domainDetails[0]}-record`, {
          name: domainDetails[0],
          zoneId: CLOUDFLARE_ZONE_ID,
          type: domainDetails[1],
          value: domainDetails[2],
          allowOverwrite: true,
          comment: `Points to AWS Amplify for stake V2 app`,
        });
        return record;
      });
    });
  }
});
