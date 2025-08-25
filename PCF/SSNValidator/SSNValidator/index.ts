import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { FinnishSSN } from 'finnish-ssn'

export class SSNValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	   * PCF framework delegate which will be assigned to this object which would be 
	   * called whenever any update happens.
	   */
	private _notifyOutputChanged: () => void;

	/** Reference to ComponentFramework Context object */
	private objContext: ComponentFramework.Context<IInputs>;

	/** Event Handler 'refreshData' reference */
	private objRefreshData: EventListenerOrEventListenerObject;

	/**
	 * Reference to the control container HTMLDivElement
	 * This element will contain all elements of our custom control which will be
	 * appended to the actual container of the control available for "init" method
	 */
	private objContainer: HTMLDivElement;

	/**Input Element of the Custom Control */
	private objInputElement: HTMLInputElement;

	/**Value of the field from control is stored and used inside custom control */
	private sInputValueToProcess: string | null | undefined;
	/**Notification from Property as Config is stored here */
	private sNotificationToUser: string | null;

	private isValidationEnabled: boolean = true;

		/**Flag to track if initial value has been set after property loading */
	private bInitialValueSet: boolean = false;

	/** Static Variables */
	public sDefaultLabel = "";
	public sDefaultErrorLabel = "Incorrect Format";
	public sDivElementClass: string = "classDiv";
	public sDivElementId: string = "sDivId";
	public sInputElementClass: string = "classInput";
	public sInputElementId: string = "sInputId";
	public sLabelElementClass: string = "classLabel";
	public sLabelElementId: string = "sLabelId";
	public sErrorLabelElementClass: string = "classErrorLabel";
	public sErrorLabelElementId: string = "sErrorLabelId";

	/**Empty constructor */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param objActualContainer If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void,
		state: ComponentFramework.Dictionary, objActualContainer: HTMLDivElement) {
		var sInputValue = ""; // Default Input Value for Text Input & Label Element

		this.objContext = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this.objRefreshData = this.refreshData.bind(this);

		this.objContainer = document.createElement("div");

		this.objInputElement = document.createElement("input");
		this.objInputElement.setAttribute("type", "text");
		this.objInputElement.setAttribute("id", this.sInputElementId);
		this.objInputElement.setAttribute("class", this.sInputElementClass);
		this.objInputElement.addEventListener("input", this.objRefreshData);
		this.objInputElement.setAttribute("placeholder", " ---");


		if (this.isValid(context.parameters.textValueToProcess)) {
			this.sInputValueToProcess = context.parameters.textValueToProcess.raw;
		}

		if (this.isValid(context.parameters.notificationToUser)) {
			this.sNotificationToUser = context.parameters.notificationToUser.raw!;
		}

		// Check if validation is enabled. Defaulted to true in the start of the class.
		if (this.isValid(context.parameters.validationEnabled.raw)) {
			this.isValidationEnabled = context.parameters.validationEnabled.raw === true;
		}

		// Set the control value on initialization
		this.objInputElement.setAttribute("value", "");

		// appending the HTML elements to the custom control's HTML container element
		this.objContainer.appendChild(this.objInputElement);

		// Append the custom control Container - "objContainer" to
		// the Actual Control Container "objActualContainer
		objActualContainer.appendChild(this.objContainer);
	}

	/**
	 * Called when any value in the property bag has changed. 
	 * This includes field values, data-sets, global values such as container height and width, 
	 * offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; 
	 * It contains values as set up by the customizer mapped to names defined in the manifest, 
	 * as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		const isDisabled = context.mode.isControlDisabled || !context.parameters.textValueToProcess.security?.editable;
		if (isDisabled) {
			this.objInputElement.setAttribute("disabled", "");
		} else {
			this.objInputElement.removeAttribute("disabled");
		}

		// storing the latest context from the control
		this.objContext = context;


		// Check if validation is enabled. Defaulted to true in the start of the class.
		const previousValidationState = this.isValidationEnabled;
		if (this.isValid(context.parameters.validationEnabled.raw)) {
			this.isValidationEnabled = context.parameters.validationEnabled.raw === true;
		}

		// Handle textValueToProcess property loading and value setting
		if (this.isValid(context.parameters.textValueToProcess)) {
			// Check if the property is still loading
			const isPropertyLoading = (context.parameters.textValueToProcess as any).isPropertyLoading;

			if (!isPropertyLoading) {
				// Property has finished loading, safe to use the value
				const currentValue = context.parameters.textValueToProcess.raw || "";
				const formattedValue = context.parameters.textValueToProcess.formatted || currentValue;

				// Only update the input element if:
				// 1. Initial value hasn't been set yet, OR
				// 2. The property value has changed from an external source (not user input)
				//    AND the input element doesn't currently have focus (user is not typing)
				const hasInputFocus = document.activeElement === this.objInputElement;

				if (!this.bInitialValueSet) {
					// Initial load - set the value
					this.sInputValueToProcess = currentValue;
					this.objInputElement.value = formattedValue;
					this.bInitialValueSet = true;

					// Trigger regex validation when value changes from external source
					this.processForSSNValidation(this.sInputValueToProcess);
				} else if (this.sInputValueToProcess !== currentValue && !hasInputFocus) {
					// Value changed externally and user is not currently typing
					this.sInputValueToProcess = currentValue;
					this.objInputElement.value = formattedValue;
					// Trigger regex validation when value changes from external source
					this.processForSSNValidation(this.sInputValueToProcess);
				}
				else if (!previousValidationState && this.isValidationEnabled && this.bInitialValueSet) {

					// set also textValueToProcess dirty to ensure that the output is updated and form validations are triggered when saved
					this.sInputValueToProcess = currentValue;
					this.objInputElement.value = formattedValue;	
					this.processForSSNValidation(this.sInputValueToProcess);
					this._notifyOutputChanged();
				}
				// If user has focus (is typing), don't update the input element to avoid interrupting their input
			}
			else {
				// Property is still loading, we do not update the value yet
			}
		}
	}

	

	/**
	 * Called when any value change occurs in Input Element TextBox
	 * @param objEvent
	 */
	public refreshData(objEvent: Event): void {
		// Read the value of Input Element
		this.sInputValueToProcess = (this.objInputElement.value as any) as string;
		this.processForSSNValidation(this.sInputValueToProcess);
		this._notifyOutputChanged();
	}

	public processForSSNValidation(sValueToProcess: string): void {
		var sNotification = this.isValid(this.sNotificationToUser) ?
			this.sNotificationToUser : this.sDefaultErrorLabel;
		var sUniqueId = sNotification + "_UniqueId";

		var objClearNotification = null;
		var objSetNotification = null;	   

		objClearNotification = this.GetFunctionFromContextUtils("clearNotification");
		objSetNotification = this.GetFunctionFromContextUtils("setNotification");
		if (this.isValid(objClearNotification) && this.isValid(objSetNotification)) {
			objClearNotification = objClearNotification as Function;
			objSetNotification = objSetNotification as Function;

	 // If validation is disabled, do not process regex validation
		if (!this.isValidationEnabled) {
			// Clear any existing notifications
			objClearNotification(sUniqueId);
			return;
		}

			if (this.isValid(sValueToProcess) &&
				!this.validateFinnishSSN(sValueToProcess)) {
				objSetNotification(sNotification, sUniqueId);
			}
			else {
				objClearNotification(sUniqueId);
			}
		}
	}

	public validateFinnishSSN(ssn: string): boolean {
		return FinnishSSN.validate(ssn);
	}

	public GetFunctionFromContextUtils(sFunctionName: string): Function | null {
		var objFunctionToReturn = null;

		if (this.isValid(this.objContext) && this.isValid(this.objContext.utils) &&
			this.isValid((this.objContext.utils as any)[sFunctionName])) {
			objFunctionToReturn = (this.objContext.utils as any)[sFunctionName] as Function;
		}

		return objFunctionToReturn;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, 
	 * expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return { textValueToProcess: this.sInputValueToProcess as string };
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. 
	 * Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		this.objInputElement.removeEventListener("input", this.objRefreshData);
	}

	public isValid(objectToProcess: any): boolean {
		var bIsObjectValid: boolean = false;
		if (objectToProcess != null && objectToProcess !== "" &&
			objectToProcess != undefined && objectToProcess !== "undefined") {
			bIsObjectValid = true;
		}
		return bIsObjectValid;
	}
}