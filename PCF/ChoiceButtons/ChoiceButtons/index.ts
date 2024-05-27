import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ChoiceButtonss from "./ChoiceButtons";

interface IContext extends ComponentFramework.Context<IInputs> {
	page: {
		entityId: string,
		entityTypeName: string,
		appId: string
		getClientUrl: () => string
	},
    theming: {
        buttons: {
            [key: string]: {
                backgroundColor: string;
            }
        }
    }
}

export class ChoiceButtons implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private container: HTMLDivElement;
    private context: ComponentFramework.Context<IInputs>;
    private currentValue: number | undefined;
	private notifyOutputChanged: () => void;
    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
		this.container = container;
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        const isDisabled = context.mode.isControlDisabled || !context.parameters.Optionset.security?.editable;

        // Add code to update control view
        const props = { 
            optionset: context.parameters.Optionset.attributes?.Options,
            onOptionsetChange: this.onOptionsetChange.bind(this),
            currentValue: context.parameters.Optionset.raw,
            primaryButtonBackrground: (context as IContext).theming.buttons.button01primary.backgroundColor,
            secondaryButtonBackground: (context as IContext).theming.buttons.button01secondary.backgroundColor,
            isDisabled
        };
        //@ts-ignore
		ReactDOM.render(React.createElement(ChoiceButtonss, props), this.container);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return { Optionset: this.currentValue };
    }

    private onOptionsetChange(value: number) {
		this.currentValue = value
		this.notifyOutputChanged();
	}
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
