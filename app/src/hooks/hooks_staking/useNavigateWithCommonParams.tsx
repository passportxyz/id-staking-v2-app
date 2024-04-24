import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const useAddCommonParamsToLink = () => {
  const [searchParams] = useSearchParams();
  const stakeOn = searchParams.get("stake_on");
  const chainId = searchParams.get("chain_id");

  const params = useMemo(
    () => [stakeOn && `stake_on=${stakeOn}`, chainId && `chain_id=${chainId}`].filter(Boolean).join("&"),
    [stakeOn, chainId]
  );

  return useCallback((to: string) => to + (params ? `?${params}` : ""), [params]);
};

export const useNavigateWithCommonParams = () => {
  const navigate = useNavigate();
  const addCommonParamsToLink = useAddCommonParamsToLink();

  return useCallback((to: string) => navigate(addCommonParamsToLink(to)), [navigate, addCommonParamsToLink]);
};
