"use client";

import { useState, useEffect } from "react";

export default function LoadingDots({ 
  color = "#000", 
  size = "1em",
  className = ""
}: { 
  color?: string;
  size?: string;
  className?: string;
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className={`inline-flex items-center ${className}`} 
      style={{ color, fontSize: size }}
      aria-label="Loading"
    >
      Loading{dots}
    </span>
  );
} 