/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */
// --- React Methods
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

// --- Components
import Signin from "./signin";
import Home from "./home";
import LeaderBoard from "./leaderboard";
import FAQ from "./faq";
import Terms from "./terms";

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
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Router>
    </div>
  );
}
