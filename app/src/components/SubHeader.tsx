export const SubHeader = ({ text, className }: { text: string; className?: string }) => (
  <h1 className={` ${className} text-2xl pt-6 pb-2 text-color-6 text-center`}>{text}</h1>
);
