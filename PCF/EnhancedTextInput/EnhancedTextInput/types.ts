export interface EnhancedTextFieldProps {
    value: string | null;
    maxLength: number;
    fieldType: string;
    isDisabled: boolean;
    isReadOnly: boolean;
    isMasked: boolean;
    isRTL: boolean;
    showCounter: boolean;
    showIcon: boolean;
    warningThresholdPercent: number;
    errorThresholdPercent: number;
    enableRegexValidation: boolean;
    regexPattern: string;
    regexValidationErrorText: string;
    onChange: (newValue: string) => void;
}

export interface EnhancedTextProps {
    used: number;
    max: number;
    warningThresholdPercent: number;
    errorThresholdPercent: number;
    isRTL: boolean;
}

export interface FieldIconProps {
    fieldType: string;
    value: string;
    isDisabled: boolean;
}

export type CounterState = "normal" | "warning" | "error" | "over";

export type RegexValidationConfiguration =
    | { status: "disabled" }
    | { status: "invalid"; errorMessage: string }
    | { status: "ready"; regex: RegExp };
