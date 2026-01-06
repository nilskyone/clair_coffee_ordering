export type PosMode = "POS" | "KIOSK";

export function getPosMode(): PosMode {
  const params = new URLSearchParams(window.location.search);
  const paramMode = params.get("mode");
  if (paramMode?.toLowerCase() === "kiosk") {
    return "KIOSK";
  }
  if (paramMode?.toLowerCase() === "pos") {
    return "POS";
  }
  return (__POS_MODE__ || "POS").toUpperCase() === "KIOSK" ? "KIOSK" : "POS";
}
