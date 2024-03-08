/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
// --- React Methods
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import { useNavigate, useSearchParams } from "react-router-dom";

// --- Shared data context
// import { useWalletStore } from "../context/walletStore";

// --- Components
import PageRoot from "../components/PageRoot";
import SIWEButton from "../components/SIWEButton";
// import { useDatastoreConnectionContext } from "../context/datastoreConnectionContext";
import { useToast } from "@chakra-ui/react";
import { DoneToastContent } from "../components/DoneToastContent";
import { WebmVideo } from "../components/WebmVideo";
import Signin  from "./signin"
import Home  from "./home"
import LeaderBoard  from "./leaderboard"
import FAQ from "./faq"

export default function Index() {
  // const [enableEthBranding, setEnableEthBranding] = useState(false);



  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </Router>
    </div>
  );
}
