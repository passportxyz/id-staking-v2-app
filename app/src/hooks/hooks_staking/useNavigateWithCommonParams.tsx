import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const useAddCommonParamsToLink = () => {
  const [searchParams] = useSearchParams();
  const stakeOn = searchParams.get("stake_on");

  return useCallback((to: string) => to + (stakeOn ? `?stake_on=${stakeOn}` : ""), [stakeOn]);
};

export const useNavigateWithCommonParams = () => {
  const navigate = useNavigate();
  const addCommonParamsToLink = useAddCommonParamsToLink();

  return useCallback(
    (to: string) => {
      console.log("to", to);
      console.log("addCommonParamsToLink(to)", addCommonParamsToLink(to));
      navigate(addCommonParamsToLink(to));
    },
    [navigate]
  );
};
