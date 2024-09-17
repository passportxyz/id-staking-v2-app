import * as pulumi from "@pulumi/pulumi";
import * as op from "@1password/op-js";
import { secretsManager, amplify } from "infra-libs";

const stack = pulumi.getStack();

const defaultTags = {
  ManagedBy: "pulumi",
  PulumiStack: stack,
  Project: "id-staking-v2",
};

const PASSPORT_APP_GITHUB_URL = op.read.parse(`op://DevOps/passport-${stack}-env/ci-staking/STAKING_APP_GITHUB_URL`);
const PASSPORT_APP_GITHUB_ACCESS_TOKEN_FOR_AMPLIFY = op.read.parse(
  `op://DevOps/passport-xyz-${stack}-secrets/ci-staking/STAKING_APP_GITHUB_ACCESS_TOKEN_FOR_AMPLIFY`
);

const CLOUDFLARE_DOMAIN = stack === "production" ? `passport.xyz` : "";
// TODO: this should be moved to id-staking-v2-${stack}-env/ci/STAKING_APP_GITHUB_URL
const CLOUDFLARE_ZONE_ID = op.read.parse(`op://DevOps/passport-${stack}-env/ci/CLOUDFLARE_ZONE_ID`);

// Passport XYZ
const passportBranches = Object({
  review: "main",
  staging: "staging-app",
  production: "production-app",
});

const coreInfraStack = new pulumi.StackReference(`passportxyz/core-infra/${stack}`);

const passportXyzAppEnvironment = secretsManager
  .getEnvironmentVars({
    vault: "DevOps",
    repo: "passport",  // TODO: this should be moved to id-staking-v2
    env: stack,
    section: "staking",  // TODO: this section should be `app` ?
  })
  .reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as Record<string, string | pulumi.Output<any>>);

const amplifyAppInfo = coreInfraStack.getOutput("newPassportDomain").apply((domainName) => {
  const prefix = "stake";
  const amplifyAppConfig: amplify.AmplifyAppConfig = {
    name: `${prefix}.${domainName}`,
    githubUrl: PASSPORT_APP_GITHUB_URL,
    githubAccessToken: PASSPORT_APP_GITHUB_ACCESS_TOKEN_FOR_AMPLIFY,
    domainName: domainName,
    cloudflareDomain: CLOUDFLARE_DOMAIN,
    cloudflareZoneId: CLOUDFLARE_ZONE_ID,
    prefix: prefix,
    branchName: passportBranches[stack],
    environmentVariables: passportXyzAppEnvironment,
    tags: { ...defaultTags, Name: `${prefix}.${domainName}` },
    buildCommand: "yarn build",
    preBuildCommand: "yarn install",
    artifactsBaseDirectory: ".next",
    customRules: [
      {
        source: "/<*>",
        status: "404",
        target: "/index.html",
      },
    ],
    platform: "WEB_COMPUTE",
    monorepoAppRoot: "app"
  };

  return amplify.createAmplifyApp(amplifyAppConfig);
});

export const amplifyAppHookUrl = pulumi.secret(amplifyAppInfo.webHook.url);