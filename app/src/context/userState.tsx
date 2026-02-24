// --- React Methods
import React from "react";

// --- Utils & configs
import { atom } from "jotai";

type UserWarningName = "expiredStamp";

export interface UserWarning {
  content: React.ReactNode;
  icon?: React.ReactNode;
  name?: UserWarningName;
  dismissible?: boolean;
  link?: string;
}

export const userWarningAtom = atom<UserWarning | undefined>(undefined);
