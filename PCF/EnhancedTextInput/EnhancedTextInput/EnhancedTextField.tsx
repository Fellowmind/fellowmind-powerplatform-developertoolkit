import * as React from "react";
import { FluentProvider, webLightTheme, Input, Textarea, tokens } from "@fluentui/react-components";
import { EnhancedText } from "./EnhancedText";
import { FieldIcon } from "./FieldIcon";
import { EnhancedTextFieldProps } from "./types";
import { isMultilineField, hasSpecialIcon } from "./utils";

// Match the Dynamics 365 / Power Apps colour palette so our inputs blend with
// the surrounding form controls.  The page's own FluentProvider uses these
// Dynamics neutral greys; by mirroring them we avoid the stark white that the
// stock webLightTheme produces.
const dynamicsTheme = {
    ...webLightTheme,
    // Input background – NeutralLighterAlt from the Dynamics 365 palette
    colorNeutralBackground1: "#faf9f8",
    colorNeutralBackground1Hover: "#f3f2f1",
    // Remove visible borders to match the default Power Apps / Dynamics 365 inputs
    colorNeutralStroke1: "transparent",
    colorNeutralStroke1Hover: "transparent",
    colorNeutralStroke1Pressed: "transparent",
    colorNeutralStrokeAccessible: "transparent",
    colorNeutralStrokeAccessibleHover: "transparent",
    colorNeutralStrokeAccessiblePressed: "transparent",
};

export const EnhancedTextField = (props: EnhancedTextFieldProps): React.ReactElement => {
    const {
        value,
        maxLength,
        fieldType,
        isDisabled,
        isReadOnly,
        isMasked,
        isRTL,
        showCounter,
        showIcon,
        warningThresholdPercent,
        errorThresholdPercent,
        onChange,
    } = props;

    const [localValue, setLocalValue] = React.useState<string>(value ?? "");
    const [isComposing, setIsComposing] = React.useState(false);

    React.useEffect(() => {
        setLocalValue(value ?? "");
    }, [value]);

    const handleChange = (newVal: string): void => {
        setLocalValue(newVal);
        if (!isComposing) {
            onChange(newVal);
        }
    };

    const handleCompositionStart = (): void => {
        setIsComposing(true);
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLElement>): void => {
        setIsComposing(false);
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        onChange(target.value);
    };

    const hasLimit = maxLength > 0;
    const showIconForType = showIcon && hasSpecialIcon(fieldType);
    const isMultiline = isMultilineField(fieldType);

    const containerStyle: React.CSSProperties = {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
    };

    const providerStyle: React.CSSProperties = { width: "100%" };

    // Masked field (no read access)
    if (isMasked) {
        return (
            <FluentProvider theme={dynamicsTheme} style={providerStyle}>
                <div style={containerStyle}>
                    <span style={{ color: tokens.colorNeutralForeground3, fontStyle: "italic" }}>
                        ••••••••
                    </span>
                </div>
            </FluentProvider>
        );
    }

    // Read-only: show plain text, icons still clickable
    if (isReadOnly) {
        return (
            <FluentProvider theme={dynamicsTheme} style={providerStyle}>
                <div style={containerStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span
                            style={{
                                flex: 1,
                                whiteSpace: isMultiline ? "pre-wrap" : "nowrap",
                                overflow: "hidden",
                                textOverflow: isMultiline ? undefined : "ellipsis",
                            }}
                        >
                            {localValue}
                        </span>
                        {showIconForType && (
                            <FieldIcon
                                fieldType={fieldType}
                                value={localValue}
                                isDisabled={false}
                            />
                        )}
                    </div>
                </div>
            </FluentProvider>
        );
    }

    const fieldIconElement = showIconForType ? (
        <FieldIcon
            fieldType={fieldType}
            value={localValue}
            isDisabled={isDisabled}
        />
    ) : undefined;

    return (
        <FluentProvider theme={dynamicsTheme} style={providerStyle}>
            <div style={containerStyle}>
                {isMultiline ? (
                    <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
                        <Textarea
                            value={localValue}
                            disabled={isDisabled}
                            resize="vertical"
                            root={{ style: { width: "100%", boxSizing: "border-box" } }}
                            textarea={{
                                style: { minHeight: "60px" },
                                onCompositionStart: handleCompositionStart,
                                onCompositionEnd: handleCompositionEnd as React.CompositionEventHandler<HTMLTextAreaElement>,
                            }}
                            onChange={(_, data) => handleChange(data.value)}
                        />
                        {showIconForType && (
                            <div style={{ position: "absolute", top: "4px", right: isRTL ? undefined : "4px", left: isRTL ? "4px" : undefined }}>
                                {fieldIconElement}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ width: "100%", boxSizing: "border-box" }}>
                        <Input
                            value={localValue}
                            disabled={isDisabled}
                            root={{ style: { width: "100%", boxSizing: "border-box" } }}
                            contentAfter={fieldIconElement}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd as React.CompositionEventHandler<HTMLInputElement>}
                            onChange={(_, data) => handleChange(data.value)}
                        />
                    </div>
                )}
                {showCounter && hasLimit && (
                    <div style={{ backgroundColor: "#ffffff", marginLeft: "-1px", marginRight: "-1px", paddingRight: "2px" }}>
                    <EnhancedText
                        used={localValue.length}
                        max={maxLength}
                        warningThresholdPercent={warningThresholdPercent}
                        errorThresholdPercent={errorThresholdPercent}
                        isRTL={isRTL}
                    />
                    </div>
                )}
            </div>
        </FluentProvider>
    );
};
