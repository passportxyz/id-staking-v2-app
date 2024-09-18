
import * as pulumi from "@pulumi/pulumi";

export const stack = pulumi.getStack();

export const defaultTags = {
  Application: "id-staking-v2",
  Repo: "https://github.com/passportxyz/id-staking-v2-app",
  PulumiStack: stack,
  Environment: stack,
  ManagedBy: "pulumi",
  Name: "missing",
};
