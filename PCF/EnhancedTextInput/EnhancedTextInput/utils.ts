import { CounterState, RegexValidationConfiguration } from "./types";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DEFAULT_REGEX_VALIDATION_ERROR = "The value does not match the required format.";
export const MISSING_REGEX_PATTERN_ERROR = "Regex validation is enabled, but no pattern is configured.";
export const INVALID_REGEX_PATTERN_ERROR = "The configured regex validation pattern is invalid.";

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

export function createRegexValidationConfiguration(
    enabled: boolean,
    pattern: string
): RegexValidationConfiguration {
    if (!enabled) {
        return { status: "disabled" };
    }

    if (pattern.length === 0) {
        return { status: "invalid", errorMessage: MISSING_REGEX_PATTERN_ERROR };
    }

    try {
        return { status: "ready", regex: new RegExp(pattern) };
    } catch (error) {
        if (error instanceof SyntaxError) {
            return { status: "invalid", errorMessage: INVALID_REGEX_PATTERN_ERROR };
        }

        throw error;
    }
}

export function getRegexValidationError(
    configuration: RegexValidationConfiguration,
    value: string,
    customErrorText: string
): string | undefined {
    if (configuration.status === "disabled") {
        return undefined;
    }

    if (configuration.status === "invalid") {
        return configuration.errorMessage;
    }

    if (value.length === 0) {
        return undefined;
    }

    configuration.regex.lastIndex = 0;
    return configuration.regex.test(value)
        ? undefined
        : customErrorText.trim() || DEFAULT_REGEX_VALIDATION_ERROR;
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
