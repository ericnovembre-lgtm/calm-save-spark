import { useEffect, useState } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode(onSuccess?: () => void) {
  const [inputs, setInputs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check localStorage for previous activation
    const wasActivated = localStorage.getItem("konami-code-activated");
    if (wasActivated) {
      setSuccess(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const newInputs = [...inputs, key].slice(-10);
      setInputs(newInputs);

      // Check if the sequence matches
      const matches = KONAMI_CODE.every(
        (code, index) => code.toLowerCase() === newInputs[index]
      );

      if (matches && !success) {
        setSuccess(true);
        localStorage.setItem("konami-code-activated", "true");
        onSuccess?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputs, success, onSuccess]);

  const reset = () => {
    setInputs([]);
    setSuccess(false);
    localStorage.removeItem("konami-code-activated");
  };

  return { success, reset };
}
