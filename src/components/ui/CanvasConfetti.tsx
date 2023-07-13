"use client";

import { useEffect } from "react";
import { showConfetti } from "@/utils";

export const CanvasConfetti = () => {
  useEffect(() => {
    showConfetti();
  }, []);
  return <></>;
};
