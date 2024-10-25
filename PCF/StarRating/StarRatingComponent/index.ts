import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import RatingComponent from "./components/StarRatingComponent"

export class StarRatingComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;    
    private ratingvalue: number | undefined;
    private maxvalue: number | undefined;
    private color: string | undefined;
    private context: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged: () => void;
    /**
     * Empty constructor.
     */
    constructor() {
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>, 
        notifyOutputChanged: () => void, 
        state: ComponentFramework.Dictionary, 
        container:HTMLDivElement): void
{
    // Add control initialization code
    this.context = context
    this.container = container    
    this.ratingvalue = this.context.parameters.ratingvalue.raw as number   
    this.maxvalue = this.context.parameters.maxvalue.raw as number
    this.color = this.context.parameters.color.raw as string || ""    
    this.notifyOutputChanged = notifyOutputChanged
}


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */    
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        
        const isDisabled = context.mode.isControlDisabled;
        const isReadOnly = !context.parameters.ratingvalue.security?.editable;

        const props = { 
            onValueChange: this.onValueChange.bind(this),             
            ratingvalue: this.ratingvalue as number,
            maxvalue: this.maxvalue as number,
            color: this.color as string,
            isReadOnly: isReadOnly as boolean,
            isDisabled: isDisabled as boolean
           };

        ReactDOM.render(React.createElement(RatingComponent, props), this.container);
    }


    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {       
        return { ratingvalue: this.ratingvalue };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this.container);
    }

    public onValueChange (newRating: number) {       
        this.ratingvalue = newRating
        this.notifyOutputChanged()
  }
}
