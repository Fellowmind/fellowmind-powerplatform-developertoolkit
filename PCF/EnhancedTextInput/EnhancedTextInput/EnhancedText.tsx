import * as React from "react";
import { tokens } from "@fluentui/react-components";
import { EnhancedTextProps, CounterState } from "./types";
import { getCounterState } from "./utils";

const counterStateStyles: Record<CounterState, React.CSSProperties> = {
    normal: {
        color: tokens.colorNeutralForeground3,
        fontWeight: tokens.fontWeightRegular,
    },
    warning: {
        color: tokens.colorPaletteMarigoldForeground1,
        fontWeight: tokens.fontWeightSemibold,
    },
    error: {
        color: tokens.colorPaletteRedForeground1,
        fontWeight: tokens.fontWeightSemibold,
    },
    over: {
        color: tokens.colorPaletteRedForeground1,
        fontWeight: tokens.fontWeightBold,
    },
};

export const EnhancedText = ({
    used,
    max,
    warningThresholdPercent,
    errorThresholdPercent,
    isRTL,
}: EnhancedTextProps): React.ReactElement => {
    const state = getCounterState(used, max, warningThresholdPercent, errorThresholdPercent);
    const style = counterStateStyles[state];
    const over = used - max;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isRTL ? "flex-start" : "flex-end",
                marginTop: "2px",
            }}
        >
            <span
                style={{
                    fontSize: tokens.fontSizeBase200,
                    lineHeight: tokens.lineHeightBase200,
                    ...style,
                }}
            >
                {used} / {max}
            </span>
            {state === "over" && (
                <span
                    style={{
                        fontSize: tokens.fontSizeBase200,
                        lineHeight: tokens.lineHeightBase200,
                        color: tokens.colorPaletteRedForeground1,
                        fontWeight: tokens.fontWeightBold,
                    }}
                >
                    {over} character{over !== 1 ? "s" : ""} over limit
                </span>
            )}
        </div>
    );
};
