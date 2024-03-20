// --- React Methods
import React from "react";

export type CustomToastProps = {
  // platformId?: PLATFORM_ID | undefined;    TODO - this was removed in staking app
  // providerId?: PROVIDER_ID;
  title: string;
  body?: React.ReactNode;
  icon: string;
  result: any;
  message?: boolean | string;
  testId?: string;
};

export const makeErrorToastProps = (title: string, message: React.ReactNode) => ({
  duration: 6000,
  isClosable: true,
  render: (result: any) => (
    <DoneToastContent title={title} body={message} icon="../assets/verification-failed-bright.svg" result={result} />
  ),
});

export const makeSuccessToastProps = (title: string, message: React.ReactNode) => ({
  duration: 6000,
  isClosable: true,
  render: (result: any) => (
    <DoneToastContent title={title} body={message} icon="../assets/check-icon2.svg" result={result} />
  ),
});

// This content overrides Chakra UI Toast style in render function
export const DoneToastContent = ({
  title,
  body,
  icon,
  result,
  message = false,
  testId,
}: CustomToastProps): JSX.Element => {
  return (
    <div className="rounded-md bg-color-1 text-background-2" data-testid={`${testId ? testId : "toast-done-toast"}}`}>
      <div className="flex p-4">
        <div className="mr-2">
          <div className="mt-1 cursor-not-allowed rounded-full">
            <img alt="information circle" className="sticky top-0 h-6" src={icon} />
          </div>
        </div>
        <div className="flex max-w-[200px] flex-col md:max-w-[390px]">
          <h2 className="mb-2 text-lg font-bold">{title}</h2>
          {message ? <p>{message}</p> : body}
        </div>
        <div className="flex flex-grow items-start justify-end">
          <button className="sticky top-0" onClick={result.onClose}>
            <img alt="close button" className="rounded-lg hover:bg-gray-500" src="./assets/x-icon-black.svg" />
          </button>
        </div>
      </div>
    </div>
  );
};
