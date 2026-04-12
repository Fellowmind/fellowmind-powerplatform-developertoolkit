import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { TagPickerContainer } from "./components/TagPickerContainer";
import { IContextExtended } from "./types";

export class ManyToManyLookup implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    public init(
        context: ComponentFramework.Context<IInputs>,
        _notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary
    ): void {
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataset = context.parameters.records as any;

        // Try multiple internal paths to extract relationship metadata from the subgrid binding.
        // getTargetEntityType() is the official PCF API for the target entity.
        const targetEntityType: string =
            context.parameters.records.getTargetEntityType?.() ??
            dataset?._customControlProperties?.EntityLogicalName ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (context.utils as any)?._customControlProperties?.descriptor?.Parameters?.TargetEntityType ??
            "";

        const relationshipName: string =
            dataset?._customControlProperties?.RelationshipName ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (context.utils as any)?._customControlProperties?.descriptor?.Parameters?.RelationshipName ??
            "";

        return React.createElement(TagPickerContainer, {
            context: context as IContextExtended,
            relationshipName,
            targetEntityType,
        });
    }

    public getOutputs(): IOutputs {
        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public destroy(): void {}
}
