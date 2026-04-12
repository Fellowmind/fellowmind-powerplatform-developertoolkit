import { CounterState } from "./types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
}

export function isPhoneField(fieldType: string): boolean {
    return fieldType === "SingleLine.Phone";
}

export function isEmailField(fieldType: string): boolean {
    return fieldType === "SingleLine.Email";
}

export function isURLField(fieldType: string): boolean {
    return fieldType === "SingleLine.URL";
}

export function isMultilineField(fieldType: string): boolean {
    return fieldType === "Multiple" || fieldType === "SingleLine.TextArea";
}

export function hasSpecialIcon(fieldType: string): boolean {
    return isPhoneField(fieldType) || isEmailField(fieldType) || isURLField(fieldType);
}

export function ensureProtocol(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

export function getCounterState(
    used: number,
    max: number,
    warningThresholdPercent: number,
    errorThresholdPercent: number
): CounterState {
    if (used > max) return "over";
    const percent = (used / max) * 100;
    if (percent >= errorThresholdPercent) return "error";
    if (percent >= warningThresholdPercent) return "warning";
    return "normal";
}
