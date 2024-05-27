// --- React Methods
import { useState } from "react";
import { useRouter } from "next/router";

// --- Components
import { Button } from "../Button";

export type PlatformScoreSpec = {
  icon?: string | undefined;
  name: string;
  description: string;
  connectMessage: string;
  isEVM?: boolean;
  enablePlatformCardUpdate?: boolean;
  website?: string;
  possiblePoints: number;
  earnedPoints: number;
};

export type PlatformCardProps = {
  platform: PlatformScoreSpec;
  className?: string;
};

export const PlatformCard = ({ platform, className }: PlatformCardProps): JSX.Element => {
  // import all providers
  const [hovering, setHovering] = useState(false);
  const verified = false;

  const platformClasses = verified
    ? "border-foreground-5  text-foreground-5 override-text-color"
    : "border-foreground-6 bg-gradient-to-t from-background2 to-background8";

  const imgFilter = {};

  // returns a single Platform card
  return (
    <div className={`max-h-[270px] max-w-[320px] bg-gradient-to-t from-background-2/30 to-background ${className}`}>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`group relative flex h-full flex-col rounded-lg border p-0 transition-all ease-out hover:shadow-even-md ${platformClasses}`}
      >
        <div className="m-6 flex h-full flex-col justify-between">
          <div className="flex w-full items-center justify-between">
            {platform.icon ? (
              <div style={imgFilter}>
                <img src={platform.icon} alt={platform.name} className={`h-10 w-10 ${verified && "grayscale"}`} />
              </div>
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.7999 24.8002H28.7999V28.8002H24.7999V24.8002ZM14 24.8002H18V28.8002H14V24.8002ZM3.19995 24.8002H7.19995V28.8002H3.19995V24.8002ZM24.7999 14.0002H28.7999V18.0002H24.7999V14.0002ZM14 14.0002H18V18.0002H14V14.0002ZM3.19995 14.0002H7.19995V18.0002H3.19995V14.0002ZM24.7999 3.2002H28.7999V7.2002H24.7999V3.2002ZM14 3.2002H18V7.2002H14V3.2002ZM3.19995 3.2002H7.19995V7.2002H3.19995V3.2002Z"
                  fill="var(--color-muted)"
                />
              </svg>
            )}
            <div className={`text-right`}>
              <h1 data-testid="available-points" className="text-2xl text-color-2">
                {Math.max(platform.possiblePoints - platform.earnedPoints, 0).toFixed(2)}
              </h1>
              <p className="text-xs text-foreground">Available Points</p>
            </div>
          </div>

          <div className="mt-4 flex justify-center md:mt-6 md:inline-block md:justify-start pb-8">
            <div
              className={`flex flex-col place-items-start text-color-2 md:flex-row ${
                platform.name.split(" ").length > 1 ? "items-center md:items-baseline" : "items-center"
              }`}
            >
              <h1
                data-testid="platform-name"
                className={`mr-0 text-xl md:mr-4 ${platform.name.split(" ").length > 1 ? "text-left" : "text-center"}`}
              >
                {platform.name}
              </h1>
            </div>
            <p
              className={`pleading-relaxed mt-2 hidden text-base text-color-1 md:inline-block ${
                verified ? "invisible" : "visible"
              } `}
            >
              {platform.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
