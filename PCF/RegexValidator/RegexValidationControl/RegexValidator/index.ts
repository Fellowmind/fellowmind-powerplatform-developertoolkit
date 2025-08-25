import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class RegexValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * PCF framework delegate which will be assigned to this object which would be 
	 * called whenever any update happens.
	 */
	private _notifyOutputChanged: () => void;

	/** Reference to ComponentFramework Context object */
	private objContext: ComponentFramework.Context<IInputs>;

	/** Event Handler 'refreshData' reference */
	// eslint-disable-next-line no-undef
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
	private sInputValueToProcess: string;
	/**Regex from Property as Config is stored here */
	private objRegexToProcess: RegExp;
	/**Notification from Property as Config is stored here */
	private sNotificationToUser: string;

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
	 */	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void,
		state: ComponentFramework.Dictionary, objActualContainer: HTMLDivElement) {
		this.objContext = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this.objRefreshData = this.refreshData.bind(this);

		this.objContainer = document.createElement("div");

		this.objInputElement = document.createElement("input");
		this.objInputElement.setAttribute("type", "text");
		this.objInputElement.setAttribute("id", this.sInputElementId);
		this.objInputElement.setAttribute("class", this.sInputElementClass);
		this.objInputElement.addEventListener("input", this.objRefreshData);
		this.objInputElement.setAttribute("placeholder", " ---")

		// Initialize regex and notification properties if available
		if (this.isValid(context.parameters.regexExpressionToProcess)) {
			this.objRegexToProcess =
				new RegExp(context.parameters.regexExpressionToProcess.raw!);
		}

		if (this.isValid(context.parameters.notificationToUser)) {
			this.sNotificationToUser = context.parameters.notificationToUser.raw!;
		}

		// Check if validation is enabled. Defaulted to true in the start of the class.
		if (this.isValid(context.parameters.validationEnabled.raw)) {
			this.isValidationEnabled = context.parameters.validationEnabled.raw === true;
		}

		// Set initial value - will be updated in updateView when property finishes loading
		this.objInputElement.setAttribute("value", "");

		//this.processForRegex(sInputValue as string);//Needed to run only on load of Control/Form

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
					this.processForRegex(this.sInputValueToProcess);
				} else if (this.sInputValueToProcess !== currentValue && !hasInputFocus) {
					// Value changed externally and user is not currently typing
					this.sInputValueToProcess = currentValue;
					this.objInputElement.value = formattedValue;

					// Trigger regex validation when value changes from external source
					this.processForRegex(this.sInputValueToProcess);
				}
				else if (!previousValidationState && this.isValidationEnabled && this.bInitialValueSet) {
					// If validation state changed to enabled, re-validate current value
					// This was added because it was possible to save invalid value when changing validation state					

					this.processForRegex(this.sInputValueToProcess);

					// set also textValueToProcess dirty to ensure that the output is updated and form validations are triggered when saved
					this.sInputValueToProcess = currentValue;
					this.objInputElement.value = formattedValue;
					// Seems like this is not working as expected

					this._notifyOutputChanged();
				}
				// If user has focus (is typing), don't update the input element to avoid interrupting their input
			}
			else {
				// Property is still loading, we do not update the value yet
			}
		}

		// Update regex expression if it has changed
		if (this.isValid(context.parameters.regexExpressionToProcess)) {
			const newRegexPattern = context.parameters.regexExpressionToProcess.raw!;
			if (!this.objRegexToProcess || this.objRegexToProcess.source !== newRegexPattern) {
				this.objRegexToProcess = new RegExp(newRegexPattern);
			}
		}

		// Update notification message if it has changed
		if (this.isValid(context.parameters.notificationToUser)) {
			this.sNotificationToUser = context.parameters.notificationToUser.raw!;
		}

		// storing the latest context from the control
		this.objContext = context;
	}

	/**
	 * Called when any value change occurs in Input Element TextBox
	 * @param objEvent
	 */
	public refreshData(objEvent: Event): void {
		// Read the value of Input Element
		this.sInputValueToProcess = (this.objInputElement.value as any) as string;
		this.processForRegex(this.sInputValueToProcess);
		this._notifyOutputChanged();

	}

	public processForRegex(sValueToProcess: string): void {
		var sNotification = this.isValid(this.sNotificationToUser) ? this.sNotificationToUser : this.sDefaultErrorLabel;
		var sUniqueId = sNotification + "_UniqueId";

		var objClearNotification = null;
		var objSetNotification = null;

		objClearNotification = this.GetFunctionFromContextUtils("clearNotification");
		objSetNotification = this.GetFunctionFromContextUtils("setNotification");


		objClearNotification = objClearNotification as Function;
		objSetNotification = objSetNotification as Function;


		// If validation is disabled, do not process regex validation
		if (!this.isValidationEnabled) {
			// Clear any existing notifications
			objClearNotification(sUniqueId);
			return;
		}
		else {
			// Check if we have a valid regex and value
			if (this.isValid(this.objRegexToProcess) && this.isValid(sValueToProcess)) {
				const regexTestResult = this.objRegexToProcess.test(sValueToProcess);

				if (!regexTestResult) {
					objSetNotification(sNotification, sUniqueId);

				} else {
					objClearNotification(sUniqueId);
				}
			} else {
				objClearNotification(sUniqueId);
			}
		}
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
		return { textValueToProcess: this.sInputValueToProcess };
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
		let bIsObjectValid: boolean = false;
		if (objectToProcess != null
			&& objectToProcess !== ""
			&& objectToProcess != undefined
			&& objectToProcess !== "undefined"
			&& (!objectToProcess.raw || this.isValid(objectToProcess.raw))) {
			bIsObjectValid = true;
		}
		return bIsObjectValid;
	}
}