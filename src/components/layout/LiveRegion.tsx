import { useEffect, useState } from "react";

export const useLiveRegion = () => {
  const [message, setMessage] = useState("");

  const announce = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1000);
  };

  return { message, announce };
};

export const LiveRegion = ({ message }: { message: string }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
