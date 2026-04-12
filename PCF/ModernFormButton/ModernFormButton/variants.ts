// ─── Type aliases ─────────────────────────────────────────────────────────────

export type ButtonStyleVariant  = "Primary" | "Secondary" | "Danger" | "Success" | "Ghost";
export type ButtonSizeVariant   = "Small" | "Medium" | "Large" | "XLarge";
export type IconPositionVariant = "Left" | "Right" | "Top" | "IconOnly";

// ─── Style variants ───────────────────────────────────────────────────────────

export interface StyleConfig {
    bg: string;
    color: string;
    hoverBg: string;
    activeBg: string;
    border: string;
    focusRing: string;
}

export const STYLE_VARIANTS: Record<ButtonStyleVariant, StyleConfig> = {
    Primary:   { bg: "#0078D4", color: "#ffffff", hoverBg: "#106EBE", activeBg: "#005A9E", border: "transparent",  focusRing: "rgba(0,120,212,0.45)"  },
    Secondary: { bg: "#f3f2f1", color: "#323130", hoverBg: "#edebe9", activeBg: "#e1dfdd", border: "#8a8886",      focusRing: "rgba(0,120,212,0.45)"  },
    Danger:    { bg: "#D13438", color: "#ffffff", hoverBg: "#A4262C", activeBg: "#8e1c21", border: "transparent",  focusRing: "rgba(209,52,56,0.45)"  },
    Success:   { bg: "#107C10", color: "#ffffff", hoverBg: "#0b6a0b", activeBg: "#085c08", border: "transparent",  focusRing: "rgba(16,124,16,0.45)"  },
    Ghost:     { bg: "transparent", color: "#0078D4", hoverBg: "rgba(0,120,212,0.08)", activeBg: "rgba(0,120,212,0.14)", border: "transparent", focusRing: "rgba(0,120,212,0.45)" },
};

// ─── Size variants ────────────────────────────────────────────────────────────

export interface SizeConfig {
    padding: string;
    iconOnlyPadding: string;
    fontSize: string;
    iconSize: string;
    gap: string;
    minHeight: string;
    fontWeight: string;
}

export const SIZE_VARIANTS: Record<ButtonSizeVariant, SizeConfig> = {
    Small:  { padding: "4px 10px",  iconOnlyPadding: "4px",  fontSize: "12px", iconSize: "14px", gap: "4px",  minHeight: "28px", fontWeight: "500" },
    Medium: { padding: "6px 14px",  iconOnlyPadding: "6px",  fontSize: "14px", iconSize: "16px", gap: "6px",  minHeight: "32px", fontWeight: "600" },
    Large:  { padding: "8px 20px",  iconOnlyPadding: "8px",  fontSize: "16px", iconSize: "20px", gap: "8px",  minHeight: "40px", fontWeight: "600" },
    XLarge: { padding: "12px 28px", iconOnlyPadding: "12px", fontSize: "18px", iconSize: "24px", gap: "10px", minHeight: "48px", fontWeight: "700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Darken a 6-digit hex colour by `pct` percent (0–100). Returns original if unparseable. */
export function darkenHex(hex: string, pct: number): string {
    const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return hex;
    const d = (c: string): string =>
        Math.max(0, Math.round(parseInt(c, 16) * (1 - pct / 100))).toString(16).padStart(2, "0");
    return `#${d(m[1])}${d(m[2])}${d(m[3])}`;
}
