import * as React from "react";
import { Button, Tooltip } from "@fluentui/react-components";
import {
    Call24Regular,
    Mail24Regular,
    Open24Regular,
    CheckmarkCircle16Filled,
    Warning16Filled,
} from "@fluentui/react-icons";
import { FieldIconProps } from "./types";
import { isPhoneField, isEmailField, isURLField, validateEmail, ensureProtocol } from "./utils";

export const FieldIcon = ({ fieldType, value, isDisabled }: FieldIconProps): React.ReactElement | null => {
    const isEmpty = !value || value.trim() === "";

    if (isPhoneField(fieldType)) {
        const handleClick = () => {
            if (!isEmpty) {
                window.open("tel:" + value);
            }
        };

        return (
            <Tooltip content="Call" relationship="label">
                <Button
                    appearance="subtle"
                    icon={<Call24Regular />}
                    onClick={handleClick}
                    disabled={isDisabled || isEmpty}
                    aria-label="Call"
                />
            </Tooltip>
        );
    }

    if (isEmailField(fieldType)) {
        const isValid = !isEmpty && validateEmail(value);
        const isInvalid = !isEmpty && !isValid;

        const handleClick = () => {
            if (!isEmpty) {
                window.open("mailto:" + value);
            }
        };

        return (
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {!isEmpty && isValid && (
                    <Tooltip content="Valid email" relationship="label">
                        <CheckmarkCircle16Filled style={{ color: "#107c10" }} />
                    </Tooltip>
                )}
                {!isEmpty && isInvalid && (
                    <Tooltip content="Invalid email" relationship="label">
                        <Warning16Filled style={{ color: "#a80000" }} />
                    </Tooltip>
                )}
                <Tooltip content="Send email" relationship="label">
                    <Button
                        appearance="subtle"
                        icon={<Mail24Regular />}
                        onClick={handleClick}
                        disabled={isDisabled || isEmpty}
                        aria-label="Send email"
                    />
                </Tooltip>
            </div>
        );
    }

    if (isURLField(fieldType)) {
        const handleClick = () => {
            if (!isEmpty) {
                window.open(ensureProtocol(value), "_blank");
            }
        };

        return (
            <Tooltip content="Open URL" relationship="label">
                <Button
                    appearance="subtle"
                    icon={<Open24Regular />}
                    onClick={handleClick}
                    disabled={isDisabled || isEmpty}
                    aria-label="Open URL"
                />
            </Tooltip>
        );
    }

    return null;
};
