/* eslint-disable @next/next/no-img-element */
// --- React Methods
import React, { useEffect, useState } from "react";

// --- Components
import { useToast } from "@chakra-ui/react";
import { Button } from "@/components/Button";

const PASSWORD_HASH = "d6b6624fca71aab378ede35a3934f9aca89c2080f7ef6ebda33eb801b7a5b035";

const digest = async (message: string): Promise<string> => {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message))), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

export const PasswordPage = ({ onAuthorized }: { onAuthorized: () => void }) => {
  // Yes, this can be hacked around.
  // Don't hack around it.
  // If you don't have the password, you are not allowed to use this app at this time

  useEffect(() => {
    const authorized = localStorage.getItem("authorized");
    if (authorized === "true") {
      onAuthorized();
    }
  }, []);

  const [input, setInput] = useState("");
  const toast = useToast();

  const checkPassword = async () => {
    if (await digest(input) === PASSWORD_HASH) {
      localStorage.setItem("authorized", "true");
      onAuthorized();
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-background to-background-6 w-screen h-screen">
      <div className="bg-[url('/assets/passwordBackground.png')] flex items-center justify-center bg-cover w-full h-full">
        <div className="bg-gradient-to-b from-background text-color-1 to-background-6 px-10 py-16 border border-background-7/50 rounded-lg flex flex-row items-center gap-8">
          <img className="h-full hidden lg:block" src={"/assets/passwordLogo.svg"} alt="Passport Logo" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xl">
              <img className="h-6" src={"/assets/passportLogoWhite.svg"} alt="Passport Logo" />
              Passport
            </div>
            <div className="text-3xl font-heading font-bold max-w-96 mb-4 leading-tight">
              Welcome to the Private Beta
            </div>
            <div>Password</div>
            <div className="flex gap-4 mt-1 flex-col md:flex-row">
              <input
                className="border border-background-7/50 rounded-lg p-2 bg-transparent"
                type="password"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkPassword()}
                value={input}
              />
              <Button onClick={checkPassword}>Unlock</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
