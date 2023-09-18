import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import FormButtonComponent from "./components/FormButton";


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

export class FormButton implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private container: HTMLDivElement;
    private context: ComponentFramework.Context<IInputs>;
    private currentValue: boolean;
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
        // Add code to update control view parameters.ibanAccountNumber.attributes.LogicalName
        const { buttonText, confirmationText, buttonActive , currentValue} = context.parameters

        const props = { buttonText: buttonText.raw, confirmationText: confirmationText.raw, buttonActive: buttonActive.raw, currentValue: currentValue.raw, onCurrentValueChange: this.onCurrentValueChange.bind(this), entityId: (context as IContext).page.entityId, entityTypeName: (context as IContext).page.entityTypeName, currentFieldName: (context as IContext).parameters.currentValue.attributes?.LogicalName, webApi: this.context.webAPI };

        ReactDOM.render(React.createElement(FormButtonComponent, props), this.container); 
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return { currentValue: this.currentValue };
    }

    private onCurrentValueChange(value: boolean) {
        // let newCurrentValue = value ? 1 : 0;
       
		this.currentValue = value;
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
