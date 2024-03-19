import axios from "axios";

export type StakeData = {
  chain: string;
  staker: string;
  stakee: string;
  amount: string;
  unlock_time: string;
  lock_duration: string;
};

export const formatDate = (date: Date): string => {
  try {
    return Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(date);
  } catch (e) {
    console.error("Error in formatDate:", e);
  }
  return "?";
};

export const getStakeHistory = async ({ queryKey }: { queryKey: string[] }): Promise<StakeData[]> => {
  // TODO filter by chain
  const address = queryKey[1];
  const response = await axios.get(`${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/registry/gtc-stake/${address}`);
  return response.data;
};


