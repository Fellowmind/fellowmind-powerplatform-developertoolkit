import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { EnhancedTextField as EnhancedTextFieldComponent } from "./EnhancedTextField";

export class EnhancedTextField implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged!: () => void;
    private currentValue: string | null = null;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const valueParam = context.parameters.value;
        const attributes = valueParam.attributes as ComponentFramework.PropertyHelper.FieldPropertyMetadata.StringMetadata | undefined;

        const rawValue: string | null = valueParam.raw ?? null;

        // Determine max length
        const maxLengthOverride = context.parameters.MaxLengthOverride.raw ?? -1;
        const metaMaxLength = attributes?.MaxLength ?? 0;
        const maxLength = maxLengthOverride >= 0 ? maxLengthOverride : metaMaxLength;

        // Field type — PCF exposes Format ("Email", "Phone", "Url", …), not Type
        const formatToFieldType: Record<string, string> = {
            "Email": "SingleLine.Email",
            "Phone": "SingleLine.Phone",
            "Url": "SingleLine.URL",
            "TextArea": "SingleLine.TextArea",
            "Text": "SingleLine.Text",
        };
        const fieldType: string = formatToFieldType[attributes?.Format ?? ""] ?? "SingleLine.Text";

        // Field security
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const security = (valueParam as any).security;
        const isMasked = security !== undefined && security.readable === false;

        return React.createElement(EnhancedTextFieldComponent, {
            value: rawValue,
            maxLength,
            fieldType,
            isDisabled: context.mode.isControlDisabled,
            isReadOnly: !context.mode.isControlDisabled && valueParam.security?.editable === false,
            isMasked,
            isRTL: context.userSettings.isRTL,
            showCounter: context.parameters.ShowCounter.raw ?? true,
            showIcon: context.parameters.ShowIcon.raw ?? true,
            warningThresholdPercent: context.parameters.WarningThresholdPercent.raw ?? 80,
            errorThresholdPercent: context.parameters.ErrorThresholdPercent.raw ?? 95,
            onChange: (newValue: string) => {
                this.currentValue = newValue;
                this.notifyOutputChanged();
            },
        });
    }

    public getOutputs(): IOutputs {
        return {
            value: this.currentValue ?? undefined,
        };
    }

    public destroy(): void {
        // no-op
    }
}
