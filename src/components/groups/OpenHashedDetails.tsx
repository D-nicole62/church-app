"use client";

import { useEffect } from "react";

function openHashedDetails() {
  const id = window.location.hash.replace("#", "");
  if (!id) return;
  const element = document.getElementById(id);
  if (element instanceof HTMLDetailsElement) {
    element.open = true;
  }
}

export function OpenHashedDetails() {
  useEffect(() => {
    openHashedDetails();
    window.addEventListener("hashchange", openHashedDetails);
    window.addEventListener("popstate", openHashedDetails);
    return () => {
      window.removeEventListener("hashchange", openHashedDetails);
      window.removeEventListener("popstate", openHashedDetails);
    };
  }, []);

  return null;
}
