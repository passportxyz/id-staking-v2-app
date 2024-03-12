// import React from "react";

// --- Types
import axios, { AxiosResponse } from "axios";
import { datadogRum } from "@datadog/browser-rum";
import { Cacao } from "@didtools/cacao";
import { DID } from "dids";

export function generateUID(length: number) {
  return window
    .btoa(
      Array.from(window.crypto.getRandomValues(new Uint8Array(length * 2)))
        .map((b) => String.fromCharCode(b))
        .join("")
    )
    .replace(/[+/]/g, "")
    .substring(0, length);
}

export function checkShowOnboard(): boolean {
  const onboardTs = localStorage.getItem("onboardTS");
  if (!onboardTs) return true;
  // Get the current Unix timestamp in seconds.
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Calculate the timestamp for 3 months ago.
  // Note that this is an approximation because months have varying numbers of days.
  const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60;
  const threeMonthsAgoTimestamp = currentTimestamp - threeMonthsInSeconds;

  const onBoardOlderThanThreeMonths =
    parseInt(onboardTs) <= threeMonthsAgoTimestamp;

  // Check if the given timestamp is within the last 3 months.
  if (onBoardOlderThanThreeMonths) {
    localStorage.removeItem("onboardTS");
  }

  return onBoardOlderThanThreeMonths;
}

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param endpoint - The graphql endpoint
 * @param query - The query to be executed
 * @param variables - The variables to be used in the query
 * @returns The result of the query
 */
export const graphql_fetch = async (
  endpoint: URL,
  query: string,
  variables: object = {}
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const resp: AxiosResponse<any> = await axios.post(
      endpoint.toString(),
      JSON.stringify({ query, variables }),
      {
        headers,
      }
    );
    return Promise.resolve(resp.data);
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(`No response received: ${error.request}`);
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Checks if the server is on maintenance mode.
 *
 * @returns True if the server is on maintenance mode, false otherwise.
 */
export const isServerOnMaintenance = () => {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON) {
    try {
      const maintenancePeriod = JSON.parse(
        process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON
      );
      const start = new Date(maintenancePeriod[0]);
      const end = new Date(maintenancePeriod[1]);
      const now = new Date();

      return now >= start && now <= end;
    } catch (error) {
      return false;
    }
  }

  return false;
};

export const createSignedPayload = async (did: DID, data: any) => {
  const { jws, cacaoBlock } = await did.createDagJWS(data);

  if (!cacaoBlock) {
    const msg = `Failed to create DagJWS for did: ${did.parent}`;
    datadogRum.addError(msg);
    throw msg;
  }

  // Get the JWS & serialize it (this is what we would send to the BE)
  const { link, payload, signatures } = jws;

  const cacao = await Cacao.fromBlockBytes(cacaoBlock);
  const issuer = cacao.p.iss;

  return {
    signatures: signatures,
    payload: payload,
    cid: Array.from(link ? link.bytes : []),
    cacao: Array.from(cacaoBlock ? cacaoBlock : []),
    issuer,
  };
};
