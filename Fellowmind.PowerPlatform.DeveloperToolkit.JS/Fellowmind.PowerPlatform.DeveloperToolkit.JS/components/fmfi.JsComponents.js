/*jshint esversion: 11 */
/// <reference path="../source/fmfi.PowerPlatform.DeveloperToolkit.JsLib.js" />

/// Global execution context that the library requires and initialize it in the form OnLoad event.
var executionContext;

/// Namespacing used in FMFI Power Platform Developer Toolkit
var fmfi = window.fmfi || {};
var JsLib = fmfi.PowerPlatform?.DeveloperToolkit?.JsLib;
fmfi.JsComponents = fmfi.JsComponents || {};

///  Path to required JSLIb in same environment
fmfi.JsComponents._JsLibMinPath = "/WebResources/fmfi_/Fellowmind.PowerPlatform.DeveloperToolkit.JS/fmfi.PowerPlatform.DeveloperToolkit.JsLib.min.js";
///  Localization file name
fmfi.JsComponents._LocalizationFileName = "fmfi_/Fellowmind.PowerPlatform.DeveloperToolkit.JS/strings/fmfi.JsComponents";

/**
 * Contains shared functions of the JSComponent library
 */
fmfi.JsComponents.Helpers = fmfi.JsComponents.Helpers || function () {
    /**
     * Common JSLIB promise for the Script
     */
    let JSLIBPromise;

    /**
     * Creates promise to add Depend Javascript library to the head of the Document
     * @param {String} src Path to the the library
     * @return {Promise}
     */
    const loadDependJS = function (src) {
        return new Promise(function (resolve, reject) {
            var scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = src;
            scriptTag.async = true;
            scriptTag.onload = function () { return resolve(); };
            scriptTag.onerror = function () { return reject(Error("Failed to load depend library from " + src)); };
            document.head.appendChild(scriptTag);
        });
    };

    return {
        JSLIBLoader: {
            /**
             * Loads asynchronously required JSlib only once
             */
            Load: async function () {
                if ((JsLib === null || JsLib === undefined) && fmfi.PowerPlatform?.DeveloperToolkit?.JsLib) {
                    JsLib = fmfi.PowerPlatform?.DeveloperToolkit?.JsLib;
                    return;
                }

                if (!JSLIBPromise) {
                    JSLIBPromise = loadDependJS(fmfi.JsComponents._JsLibMinPath).finally(() => {
                        JSLIBPromise = undefined;
                    });
                }

                if (JsLib === null || JsLib === undefined) {
                    await JSLIBPromise;
                    JsLib = fmfi.PowerPlatform.DeveloperToolkit.JsLib;
                }
            }
        },
        Common: {
            /**
             * Converts Power Platform field value or array of values to array that contains only strings in lower case.
             * If Field type is lookup, array will contain only record IDs
             * If field Value is null, array contains one empty string
             * @param {*} fieldValue Power Platform Field Value
             * @return {Array} Array of strings in lower case.
             */
            ConvertFieldValueToStringArray: function (fieldValue) {
                if (JsLib.Helper.IsNullOrUndefined(fieldValue)) {
                    return [""];
                } else if (Array.isArray(fieldValue)) {
                    let a = fieldValue;
                    if (a.length > 0 && typeof a[0] === 'object' && !Array.isArray(a[0]) && a[0] !== null) {
                        // Field value lookup, get only IDs
                        a = a.map(a => JsLib.Helper.RemoveParenthesisFromGUID(a.id).toLowerCase());
                    } else if (a.length > 0 && typeof a[0] !== 'object' && !Array.isArray(a[0]) && a[0] !== null) {
                        a = a.map(a => JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase());
                    } else if (a.length === 0 || (a.length === 1 && a[0] === null)) {
                        a = [""];
                    }
                    return a;
                } else {
                    return [fieldValue.toString().toLowerCase()];
                }
            },
            /**
             * Common JSON settings parser and validator
             * @param {String} settingsJSON User defined settings JSON from On Load Event
             * @param {String} componentJSONModel JSON model that component uses
             * @return {Object} settings JSON converted to the Object 
             */
            ParseSettings: function (settingsJSON, componentJSONModel) {
                let settings;
                try {
                    settings = JSON.parse(settingsJSON);
                } catch (error) {
                    let throwError = Error('Error when parsing JSON. \nJSON must be inside single quation marks! \nExample: \'' + componentJSONModel);
                    fmfi.JsComponents.Helpers.Common.ShowError(throwError);
                    throw throwError;
                }

                if (JsLib.Helper.IsNullOrUndefined(settings) || (Array.isArray(JSON.parse(componentJSONModel)) && settings.length <= 0)) {
                    let error = Error('Settings array missing or empty from JSON. \nExample: \'' + componentJSONModel + "\'");
                    fmfi.JsComponents.Helpers.Common.ShowError(error);
                    throw error;
                }
                return settings;
            },
            /**
             * Creates generic error. Adds example json model if provided to the error message-
             * @param {String} error Error message
             * @param {Object} component Component object that contains name of the component and JSON model of the settings for the component 
             * @return {Error} formatted error
             */
            CreateError: function (error, component) {
                let message = component.name + " " + (error.message ?? error);
                let errorDetail = " \n";
                if (!JsLib.Helper.IsNullOrUndefined(component.JSONModel)) {
                    errorDetail += "Example: \'" + component.JSONModel + "\' \n";
                }
                return Error(message + errorDetail);
            },
            /**
             * Shows error dialog to the user
             * @param {Error/String} error Error object or error message 
             * @param {String} componentName Component name where error occurred
             * @param {String} componentJSONModel 
             */
            ShowError: function (error, componentName, componentJSONModel) {
                let message = componentName + " " + (error.message ?? error);
                let errorDetail = error.stack ?? error.raw;
                let detailsHeader = message + " \n";
                if (!JsLib.Helper.IsNullOrUndefined(componentJSONModel)) {
                    detailsHeader += "Example: \'" + componentJSONModel + "\' \n";
                }
                Xrm.Navigation.openErrorDialog({ message: message, details: detailsHeader + errorDetail });
            },
            CalculateDialogDimension(text) {
                let dimensions = { height: null, width: null };
                if (!JsLib.Helper.IsNullOrUndefined(text) && (text.length > 100 || text.split("\n").length >= 3)) {
                    let alertHeight = Math.max(((text.length / 70) * 20 * (text.split("\n").length + 1)) + 100, 150);
                    dimensions = { height: alertHeight, width: 450 };
                }
                return dimensions;
            }
        }
    };
}();

/**
 * Locks Form based on other field value
 */
fmfi.JsComponents.FormLocker = fmfi.JsComponents.FormLocker || function () {
    const component = {
        name: "FormLocker",
        JSONModel: '{"lookupFieldToParentTable":"FIELD_SCHEMA_NAME", "sourceField": "FIELD_SCHEMA_NAME", "lockingValues": ["FIELD_VALUE"], "reverseLockingValues": false, "exceptionFields": ["FIELD_SCHEMA_NAME"]}'
    };

    /**
     * Validates component settings and adds default values
     * @param {Object} settings Settings object
     */
    const ValidateSettings = function (settings) {
        if (JsLib.Helper.IsNullOrUndefined(settings.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.lockingValues) || settings.lockingValues.length <= 0) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("lockingValues missing or array empty from the Settings JSON", component);
        } else {
            settings.lockingValues = settings.lockingValues.map(a => !JsLib.Helper.IsNullOrUndefined(a) ? JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase() : "");
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.exceptionFields)) {
            settings.exceptionFields = [];
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.reverseLockingValues)) {
            settings.reverseLockingValues = false;
        }
    };

    /**
     * Locks form based on provided Settings
     * @param {Object} settings Settings object
     * @returns Returns in the middle if form should not be locked
     */
    const LockForm = async function (settings) {
        let sourceFieldValueAsArray;
        if (!JsLib.Helper.IsNullOrUndefined(settings.lookupFieldToParentTable)) {
            let lookupFieldValue = JsLib.UI.Field.GetValue(settings.lookupFieldToParentTable);
            if (JsLib.Helper.IsNullOrUndefined(lookupFieldValue)) {
                return;
            }

            let queryOptions = "?$select=" + settings.sourceField;
            let record = await JsLib.WebAPI.CRUD.RetrieveByIDSync(lookupFieldValue[0].entityType, lookupFieldValue[0].id, queryOptions).catch((error) => {
                fmfi.JsComponents.Helpers.Common.ShowError(error, component.name);
            });
            sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(record[settings.sourceField]);
        } else {
            sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(settings.sourceField));
        }

        if (JsLib.Helper.IsNullOrUndefined(sourceFieldValueAsArray)) {
            return;
        }

        let valueInLockingValues = sourceFieldValueAsArray.some(value => {
            return settings.lockingValues.includes(value);
        });

        if (settings.reverseLockingValues ? !valueInLockingValues : valueInLockingValues) {
            JsLib.UI.Form.SetFormFieldsState(false, settings.exceptionFields);
        }
    };

    return {
        BasedOnFieldValue: {
            /**
             * 
             * Adds OnChange listeners to the sourceField or lookupFieldToParentTable-field and runs logic
             *
             * Form OnLoad event. This is the ONLY event you should call from your form.
             * Full namespace is required when called via form: fmfi.JsComponents.FormLocker.BasedOnFieldValue.OnLoad.
             * Remember to pass the execution context.
             * 
             * @param {*} initExecutionContext Execution context
             * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
             */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                ValidateSettings(settings);

                let onChangeField = settings.sourceField;
                if (!JsLib.Helper.IsNullOrUndefined(settings.lookupFieldToParentTable)) {
                    onChangeField = settings.lookupFieldToParentTable;
                }

                JsLib.UI.Listeners.Field.RegisterOnChangeEvent(onChangeField, function () {
                    if (JsLib.UI.Form.IsDirty()) {
                        JsLib.Record.Save(undefined, function () {
                            JsLib.UI.Form.GetCurrentForm().navigate();
                        }, function () { });
                    } else {
                        JsLib.UI.Form.GetCurrentForm().navigate();
                    }
                });

                LockForm(settings).catch((error) => {
                    fmfi.JsComponents.Helpers.Common.ShowError(error, component.name, component.JSONModel);
                });
            }
        }
    };
}();

/**
 * Changes current Form based on Field Value or active Business Process Flow
 */
fmfi.JsComponents.FormSwitch = fmfi.JsComponents.FormSwitch || function () {

    /**
    * Validates component settings and adds default values
    * @param {Object} settings Settings object
    */
    const ValidateSettingsBasedOnFieldValue = function (settings, component) {
        if (JsLib.Helper.IsNullOrUndefined(settings.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.fieldSettings)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSettings missing or empty from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.switchIfNewForm)) {
            settings.switchIfNewForm = true;
        }

        for (let [key, value] of Object.entries(settings.fieldSettings)) {
            if (JsLib.Helper.IsNullOrUndefined(value)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError("Form GUID is empty or invalid in the Settings JSON", component);
            } else {
                settings.fieldSettings[key] = JsLib.Helper.RemoveParenthesisFromGUID(value.toString()).toLowerCase();
            }
        }
    };

    /**
     * Collects dirty form fields to the object and sets fields submit mode to never.
     * Called before  form change on new record form.
     * @return {Object} Dirty form field values as object 
     */
    const populateEntityFormParameters = function () {
        let parameters = {};
        let attributes = JsLib.Record.GetRecordAttributes();
        if (attributes != null) {
            for (let i in attributes) {
                if (attributes[i].getIsDirty() && attributes[i].getValue()) {
                    parameters[attributes[i].getName()] = attributes[i].getValue();
                    attributes[i].setSubmitMode(JsLib.Enums.Field_SubmitModes.NEVER);
                } else if (attributes[i].getIsDirty()) {
                    attributes[i].setSubmitMode(JsLib.Enums.Field_SubmitModes.NEVER);
                }
            }
        }
        return parameters;
    };

    /**
     * Switches form based on provided settings
     * @param {Object} settings Settings object
     * @returns Returns in the middle if form should not be switched
     */
    const SwitchFormBasedOnFieldValue = async function (settings) {
        if (!settings.switchIfNewForm && JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
            return;
        }

        let sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(settings.sourceField));
        const currentFormItem = JsLib.UI.Form.GetCurrentForm();

        sourceFieldValueAsArray.every(function (value) {
            value = value.length !== 0 ? value : "null";
            const fieldSetForms = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(settings.fieldSettings[value]);
            const isCurrentFormCorrect = fieldSetForms.some(formSet => {
                return formSet === currentFormItem.getId().toLowerCase();
            });

            if (isCurrentFormCorrect) {
                return false;
            }

            JsLib.UI.Form.GetCurrentEntityAllForms().forEach(function (form) {
                const containsForm = fieldSetForms.some(formSet => {
                    return formSet === form.getId().toLowerCase();
                });

                if (containsForm) {
                    if (JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
                        JsLib.UI.Form.OpenFormNewRecord(JsLib.Record.GetEntityName(), false, false, populateEntityFormParameters(), form.getId().toLowerCase());
                    } else if (JsLib.UI.Form.IsDirty()) {
                        JsLib.Record.Save(undefined, function () {
                            form.navigate();
                        }, function () { });
                    } else {
                        form.navigate();
                    }
                }
            });
        });
    };

    /**
    * Validates component settings and adds default values
    * @param {Object} settings Settings object
    */
    const ValidateSettingsBasedOnBPF = function (settings, component) {
        if (JsLib.Helper.IsNullOrUndefined(settings.settings)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("settings missing or empty from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.switchIfNewForm)) {
            settings.switchIfNewForm = true;
        }

        for (let [key, value] of Object.entries(settings.settings)) {
            if (JsLib.Helper.IsNullOrUndefined(value)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError("Form GUID is empty or invalid in the Settings JSON", component);
            } else {
                settings.settings[key] = JsLib.Helper.RemoveParenthesisFromGUID(value.toString()).toLowerCase();
            }
        }
    };

    /**
    * Switches form based on provided settings
    * @param {Object} settings Settings object
     * @returns Returns in the middle if form should not be switched
    */
    const SwitchFormBasedOnBPF = async function (settings) {
        if (!settings.switchIfNewForm && JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
            return;
        }

        const currentBPF = JsLib.UI.BPF.GetActiveProcess();
        const currentFormItem = JsLib.UI.Form.GetCurrentForm();
        let value = !JsLib.Helper.IsNullOrUndefined(currentBPF) && currentBPF.getId() ? currentBPF.getId().toLowerCase() : "null";

        const fieldSetForms = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(settings.settings[value]);
        const isCurrentFormCorrect = fieldSetForms.some(formSet => {
            return formSet === currentFormItem.getId().toLowerCase();
        });

        if (isCurrentFormCorrect) {
            return false;
        }

        JsLib.UI.Form.GetCurrentEntityAllForms().forEach(function (form) {
            const containsForm = fieldSetForms.some(formSet => {
                return formSet === form.getId().toLowerCase();
            });

            if (containsForm) {
                if (JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
                    JsLib.UI.Form.OpenFormNewRecord(JsLib.Record.GetEntityName(), false, false, populateEntityFormParameters(), form.getId().toLowerCase());
                } else if (JsLib.UI.Form.IsDirty()) {
                    JsLib.Record.Save(undefined, function () {
                        form.navigate();
                    }, function () { });
                } else {
                    form.navigate();
                }
            }
        });

    };

    return {
        BasedOnFieldValue: {
            /**
            * 
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Do not use same time with FormSwitch.BasedOnBPF
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.FormSwitch.BasedOnFieldValue.OnLoad
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "FormSwitch.BasedOnFieldValue",
                    JSONModel: '{"sourceField": "FIELD_SCHEMA_NAME", "fieldSettings": {"FIELD_VALUE": ["FORM_GUID"], "FIELD_VALUE": ["FORM_GUID"]}, "switchIfNewForm": true}'
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                ValidateSettingsBasedOnFieldValue(settings, component);
                JsLib.UI.Listeners.Field.RegisterOnChangeEvent(settings.sourceField, function () {
                    SwitchFormBasedOnFieldValue(settings);
                });

                await SwitchFormBasedOnFieldValue(settings);
            }
        },
        BasedOnBPF: {
            /**
            * 
            * Runs Logic Form OnLoad
            * 
            * Do not use same time with FormSwitch.BasedOnFieldValue
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.FormSwitch.BasedOnBPF.OnLoad
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "FormSwitch.BasedOnBPF",
                    JSONModel: '{"settings": {"BPF_GUID": ["FORM_GUID"], "BPF_GUID": ["FORM_GUID"]}, "switchIfNewForm": true}'
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                ValidateSettingsBasedOnBPF(settings, component);
                await SwitchFormBasedOnBPF(settings);
            }
        }
    };
}();

/**
 * Changes Business Process Flow based on field value
 */
fmfi.JsComponents.BPFSwitch = fmfi.JsComponents.BPFSwitch || function () {
    const component = {
        name: "BPFSwitch",
        JSONModel: '{"sourceField": "FIELD_SCHEMA_NAME", "fieldSettings": {"FIELD_VALUE": "BPF_GUID", "FIELD_VALUE": "BPF_GUID"}, "showIfValueNotInSettings": false}'
    };

    /**
     * Validates component settings and adds default values
     * @param {Object} settings Settings object
     */
    const ValidateSettings = function (settings) {
        if (JsLib.Helper.IsNullOrUndefined(settings.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.fieldSettings)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSettings missing or empty from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(settings.showIfValueNotInSettings)) {
            settings.showIfValueNotInSettings = false;
        }

        for (let [key, value] of Object.entries(settings.fieldSettings)) {
            if (JsLib.Helper.IsNullOrUndefined(value)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError("BPF GUID is empty or invalid in the Settings JSON", component);
            } else {
                settings.fieldSettings[key] = JsLib.Helper.RemoveParenthesisFromGUID(value.toString()).toLowerCase();
            }
        }
    };

    /**
     * Switches business process flow based on provided settings
     * Hides Business Process flow on new record form
     * @param {Object} settings Settings object
     * @returns Returns in the middle if business process flow should not be switched
     */
    const SwitchBPFBasedOnFieldValue = async function (settings) {
        JsLib.UI.BPF.SetVisibility(false);
        if (JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
            return;
        }

        const currentBPF = JsLib.UI.BPF.GetActiveProcess();
        let sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(settings.sourceField));

        let shouldBPFBeVisible = false;
        sourceFieldValueAsArray.every(function (value) {
            value = value.length !== 0 ? value : "null";
            if (!JsLib.Helper.IsNullOrUndefined(settings.fieldSettings[value]) && (JsLib.Helper.IsNullOrUndefined(currentBPF) || !currentBPF.getId() || currentBPF.getId().toLowerCase() !== settings.fieldSettings[value])) {
                if (JsLib.UI.Form.IsDirty()) {
                    JsLib.Record.Save(undefined, function () {
                        JsLib.UI.BPF.SetActiveProcess(settings.fieldSettings[value]);
                    }, function () { });
                } else {
                    JsLib.UI.BPF.SetActiveProcess(settings.fieldSettings[value]);
                }
                shouldBPFBeVisible = true;
                return false;
            } else if (!JsLib.Helper.IsNullOrUndefined(settings.fieldSettings[value]) && !JsLib.Helper.IsNullOrUndefined(currentBPF) && (!currentBPF.getId() || currentBPF.getId().toLowerCase() === settings.fieldSettings[value])) {
                shouldBPFBeVisible = true;
                return false;
            }
        });
        if (!JsLib.UI.BPF.IsVisible() && (shouldBPFBeVisible || settings.showIfValueNotInSettings)) {
            JsLib.UI.BPF.SetVisibility(true);
        }
    };

    return {
        BasedOnFieldValue: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.BPFSwitch.BasedOnFieldValue.OnLoad.
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                ValidateSettings(settings);
                JsLib.UI.Listeners.Field.RegisterOnChangeEvent(settings.sourceField, function () {
                    SwitchBPFBasedOnFieldValue(settings);
                });

                await SwitchBPFBasedOnFieldValue(settings);
            }
        }
    };
}();


fmfi.JsComponents.CopyFieldValue = fmfi.JsComponents.CopyFieldValue || function () {
    const component = {
        name: "CopyFieldValue",
        JSONModel: '[{"sourceField":"FIELD_SCHEMA_NAME", "fieldSettings": [{"sourceField": "FIELD_API_NAME",  "targetField": "FIELD_SCHEMA_NAME", "fireOnChange": true, "overwriteValue": true}]}]'
    };

    /**
    * Validates component settings and adds default values
    * @param {Object} attribute One setting from Settings array
    */
    const ValidateSettings = function (attribute) {
        if (JsLib.Helper.IsNullOrUndefined(attribute.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.fieldSettings) || attribute.fieldSettings.length <= 0) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSettings missing or empty the from Settings JSON", component);
        }

        attribute.fieldSettings.forEach(function (fieldset) {
            if (JsLib.Helper.IsNullOrUndefined(fieldset.sourceField)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSettings.sourceField missing or empty from the Settings JSON", component);
            }
            if (JsLib.Helper.IsNullOrUndefined(fieldset.targetField)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSettings.targetField missing or empty from Settings the JSON", component);
            }
            if (JsLib.Helper.IsNullOrUndefined(fieldset.overwriteValue)) {
                fieldset.overwriteValue = true;
            }
            if (JsLib.Helper.IsNullOrUndefined(fieldset.fireOnChange)) {
                fieldset.fireOnChange = true;
            }
        });
    };

    /**
     * Queries source field values from parent record and sets them in the target fields
     * @param {Object} attribute One object from the settings array
     */
    const CopyFieldValue = async function (attribute) {
        const lookupSourceField = attribute.sourceField;
        const fieldSettings = attribute.fieldSettings;
        let lookupFieldValue = JsLib.UI.Field.GetValue(lookupSourceField);
        let parentRecord;

        if (lookupFieldValue) {
            let queryOptions = "?$select=" + fieldSettings.map(a => a.sourceField).toString();
            parentRecord = await JsLib.WebAPI.CRUD.RetrieveByIDSync(lookupFieldValue[0].entityType, lookupFieldValue[0].id, queryOptions).catch((error) => {
                fmfi.JsComponents.Helpers.Common.ShowError(error, component.name);
            });
        }

        fieldSettings.forEach(function (fieldset) {
            const sourceField = fieldset.sourceField;
            const targetField = fieldset.targetField;
            const overwriteValue = fieldset.overwriteValue;
            const targetFieldValue = JsLib.UI.Field.GetValue(targetField);

            if (!JsLib.Helper.IsNullOrUndefined(targetFieldValue) && !overwriteValue) {
                return;
            }

            if ((JsLib.Helper.IsNullOrUndefined(parentRecord) || JsLib.Helper.IsNullOrUndefined(parentRecord[sourceField])) && JsLib.UI.Form.GetType() !== JsLib.Enums.FormType.CREATE) {
                JsLib.UI.Field.SetValue(targetField, null);
                return;
            } else if (JsLib.Helper.IsNullOrUndefined(parentRecord) || JsLib.Helper.IsNullOrUndefined(parentRecord[sourceField])) {
                return;
            }

            if (!JsLib.Helper.IsNullOrUndefined(parentRecord[sourceField + "@Microsoft.Dynamics.CRM.lookuplogicalname"])) {
                JsLib.UI.Field.SetLookupValue(targetField, parentRecord[sourceField + "@Microsoft.Dynamics.CRM.lookuplogicalname"], parentRecord[sourceField], parentRecord[sourceField + "@OData.Community.Display.V1.FormattedValue"]);
            } else {
                JsLib.UI.Field.SetValue(targetField, parentRecord[sourceField]);
            }

            if (fieldset.fireOnChange) {
                JsLib.UI.Field.TriggerOnChange(targetField);
            }

        });
    };

    return {
        FromRelatedTable: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.CopyFieldValue.FromRelatedTable.OnLoad.
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }

                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                settings.forEach(function (attribute) {
                    ValidateSettings(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute.sourceField, function () {
                        CopyFieldValue(attribute).catch((error) => {
                            fmfi.JsComponents.Helpers.Common.ShowError(error, component.name, component.JSONModel);
                        });
                    });

                    if (JsLib.UI.Form.GetType() === JsLib.Enums.FormType.CREATE) {
                        CopyFieldValue(attribute).catch((error) => {
                            fmfi.JsComponents.Helpers.Common.ShowError(error, component.name, component.JSONModel);
                        });
                    }
                });
            }
        }
    };
}();

/**
 * Shows form tabs and section based on field value
 */
fmfi.JsComponents.FormTabAndSectionVisibility = fmfi.JsComponents.FormTabAndSectionVisibility || function () {
    const component = {
        name: "FormTabAndSectionVisibility",
        JSONModel: '[{"sourceField":"FIELD_SCHEMA_NAME", "fieldSettings":  [{"fieldValues": ["FIELD_VALUE"], "reverseValues": false, "showSettings": [{"tabName": "TAB_NAME" , "sectionNames": []},{"tabName": "TAB_NAME" , "sectionNames": ["SECTION_NAME1", "SECTION_NAME2"]}]}] }]'
    };

    /**
     * Validates component settings and adds default values
     * @param {Object} attribute One setting from Settings array
     */
    const ValidateSetting = function (attribute) {
        if (JsLib.Helper.IsNullOrUndefined(attribute.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from Settings the JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.fieldSettings) || attribute.fieldSettings.length <= 0) {
            throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " fieldSettings parameter is missing or empty from the Settings JSON", component);
        }

        attribute.fieldSettings.forEach(function (fieldset) {
            if (JsLib.Helper.IsNullOrUndefined(fieldset.fieldValues) || fieldset.fieldValues.length <= 0) {
                throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " fieldValues parameter is missing or empty from the Settings JSON", component);
            } else {
                fieldset.fieldValues = fieldset.fieldValues.map(a => !JsLib.Helper.IsNullOrUndefined(a) ? JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase() : "");
            }

            if (JsLib.Helper.IsNullOrUndefined(fieldset.showSettings)) {
                throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " showSettings parameter is missing or empty from the Settings JSON", component);
            }

            if (JsLib.Helper.IsNullOrUndefined(fieldset.reverseValues)) {
                attribute.fieldset.reverseValues = false;
            }

            fieldset.showSettings.forEach(function (showsetting) {
                if (JsLib.Helper.IsNullOrUndefined(showsetting.tabName)) {
                    throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " tabName parameter is missing or empty from the Settings JSON", component);
                }
                if (JsLib.Helper.IsNullOrUndefined(showsetting.sectionNames)) {
                    showsetting.sectionNames = [];
                }
            });
        });
    };

    /**
     * Shows tab and section based on provided settings
     * @param {*} attribute One setting from Settings array
     */
    const ShowTabsAndSections = function (attribute) {
        let sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(attribute.sourceField));
        let tabsToSetVisible = [];
        let tabsToHide = [];
        let sectionsToSetVisible = [];
        let sectionsToHide = [];

        attribute.fieldSettings.forEach(function (fieldset) {
            const fieldValues = fieldset.fieldValues;
            const reverseValues = fieldset.reverseValues;
            const visibility = reverseValues ? !fieldValues.some(item => sourceFieldValueAsArray.includes(item)) : fieldValues.some(item => sourceFieldValueAsArray.includes(item));

            fieldset.showSettings.forEach(function (showsetting) {
                const tabName = showsetting.tabName;
                if (visibility) {
                    tabsToSetVisible.push(tabName);
                } else if (showsetting.sectionNames.length === 0) {
                    tabsToHide.push(tabName);
                }
                showsetting.sectionNames.forEach(function (name) {
                    let sec = { sectionName: name, tabName: tabName };
                    if (visibility) {
                        sectionsToSetVisible.push(sec);
                    } else {
                        sectionsToHide.push(sec);
                    }
                });
            });
        });

        tabsToHide = tabsToHide.filter(function (tab) {
            return !tabsToSetVisible.includes(tab);
        });

        tabsToSetVisible.forEach(function (tab) {
            JsLib.UI.Tab.SetVisibility(tab, true);
        });

        tabsToHide.forEach(function (tab) {
            JsLib.UI.Tab.SetVisibility(tab, false);
        });

        sectionsToHide = sectionsToHide.filter(function (sec) {
            return !sectionsToSetVisible.some(s => s.tabName === sec.tabName && s.sectionName === sec.sectionName);
        });

        sectionsToSetVisible.forEach(function (sec) {
            JsLib.UI.Section.SetVisibility(sec.tabName, sec.sectionName, true);
        });

        sectionsToHide.forEach(function (sec) {
            JsLib.UI.Section.SetVisibility(sec.tabName, sec.sectionName, false);
        });
    };

    return {
        BasedOnFieldValue: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.FormTabAndSectionVisibility.BasedOnFieldValue.OnLoad.
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                settings.forEach(function (attribute) {
                    ValidateSetting(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute.sourceField, function () {
                        ShowTabsAndSections(attribute);
                    });
                    ShowTabsAndSections(attribute);
                });
            }
        }
    };
}();

/**
 * Contains configurable helper functions
 */
fmfi.JsComponents.FieldHelpers = fmfi.JsComponents.FieldHelpers || function () {

    /**
     * Autosaves Form when field value changes
     * @param {*} attribute One field from Settings array
     */
    const AutoSaveOnChange = function (attribute) {
        JsLib.UI.Field.SetSubmitMode(attribute, JsLib.Enums.Field_SubmitModes.ALWAYS);
        JsLib.Record.Save(undefined, function () {
            JsLib.UI.Field.SetSubmitMode(attribute, JsLib.Enums.Field_SubmitModes.DIRTY);
        }, function () { });
    };

    /**
    * Autosaves Form when field value changes and then shows custom page.
    * @param {*} attribute One object from Settings array
    */
    const OpenCustomPageOnChange = async function (attribute) {
        JsLib.UI.Field.SetSubmitMode(attribute.targetField, JsLib.Enums.Field_SubmitModes.ALWAYS);
        JsLib.Record.Save(undefined, function () {
            JsLib.UI.CustomPage.OpenFromFormRibbon(JsLib.Record.GetEntityName(), JsLib.Record.GetId(), attribute.customPage, attribute.customPageType);
            JsLib.UI.Field.SetSubmitMode(attribute.targetField, JsLib.Enums.Field_SubmitModes.DIRTY);
        }, function () { });
    };

    return {
        AutoSaveOnChange: {
            /**
            * Adds OnChange listeners to the fields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.FieldHelpers.AutoSaveOnChange.OnLoad
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "FieldHelpers.AutoSaveOnChange",
                    JSONModel: '["FIELD_SCHEMA_NAME"]'
                };

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("fieldSchemaNames missing from Settings the JSON", component);
                    }
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                settings.forEach(function (attribute) {
                    ValidateSetting(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute, function () {
                        AutoSaveOnChange(attribute);
                    });
                });
            }
        },
        OpenCustomPageOnChange: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.FieldHelpers.OpenCustomPageOnChange.OnLoad
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "FieldHelpers.OpenCustomPageOnChange",
                    JSONModel: '[{"targetField":"FIELD_SCHEMA_NAME", "customPage": "CUSTOM_PAGE_LOGICAL_NAME", "customPageType": "CUSTOM_PAGE_TYPE"}]'
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute.targetField)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("targetField missing from Settings the JSON", component);
                    }
                    if (JsLib.Helper.IsNullOrUndefined(attribute.customPage)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("customPage missing from Settings the JSON", component);
                    }
                    if (JsLib.Helper.IsNullOrUndefined(attribute.customPageType)) {
                        attribute.customPageType = JsLib.Enums.CustomPageType.DIALOG;
                    } else {
                        if (attribute.customPageType.toLowerCase() === "dialog") {
                            attribute.customPageType = JsLib.Enums.CustomPageType.DIALOG;
                        } else if (attribute.customPageType.toLowerCase() === "inline") {
                            attribute.customPageType = JsLib.Enums.CustomPageType.INLINE;
                        } else if (attribute.customPageType.toLowerCase() === "sidedialog") {
                            attribute.customPageType = JsLib.Enums.CustomPageType.SIDEDIALOG;
                        } else {
                            attribute.customPageType = JsLib.Enums.CustomPageType.DIALOG;
                        }
                    }
                };

                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                settings.forEach(function (attribute) {
                    ValidateSetting(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute.targetField, function () {
                        OpenCustomPageOnChange(attribute);
                    });
                });
            }
        },

    };
}();

/**
 * Manipulates Choice-column values
 */
fmfi.JsComponents.ChoiceManipulator = fmfi.JsComponents.ChoiceManipulator || function () {
    /// Object where cache component choice values before manipulating them
    let _choiceValueCache = {};

    /** 
    * Validates component settings and adds default values
    * @param {Object} attribute One setting from Settings array
    * @param {Object} component Details of the component
    */
    const ValidateSettingShowChoiceValuesBasedOnFieldValue = async function (attribute, component) {
        if (JsLib.Helper.IsNullOrUndefined(attribute.sourceField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("sourceField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.targetField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("targetField missing from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.fieldSettings) || attribute.fieldSettings.length <= 0) {
            throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " fieldSettings parameter is missing or empty from the Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.showAlwaysCurrentValue)) {
            attribute.showAlwaysCurrentValue = true;
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.clearChildValueOnParentChange)) {
            attribute.clearChildValueOnParentChange = true;
        }

        attribute.fieldSettings.forEach(function (fieldset) {
            if (JsLib.Helper.IsNullOrUndefined(fieldset.fieldValues) || fieldset.fieldValues.length <= 0) {
                throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " fieldValues parameter is missing or empty from the Settings JSON", component);
            } else {
                fieldset.fieldValues = fieldset.fieldValues.map(a => !JsLib.Helper.IsNullOrUndefined(a) ? JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase() : "");
            }

            if (JsLib.Helper.IsNullOrUndefined(fieldset.choiceValuesToShow) || fieldset.choiceValuesToShow.length <= 0) {
                throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.sourceField + " choiceValuesToShow parameter is missing or empty from the Settings JSON", component);
            } else {
                fieldset.choiceValuesToShow = fieldset.choiceValuesToShow.map(a => JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase());
            }
        });
    };


    /**
     * Shows only choice values that are defined in settings.
     * @param {*} attribute One setting from Settings array
     * @param {*} isOnChange Is triggering event OnChange
     */
    const ShowChoiceValuesBasedOnFieldValue = async function (attribute, isOnChange) {
        const choiceControls = JsLib.UI.Field.GetField(attribute.targetField, true)?.controls;
        if (!_choiceValueCache[attribute.targetField]) {
            _choiceValueCache[attribute.targetField] = JsLib.UI.Optionset.GetOptions(attribute.targetField);
        } else if (_choiceValueCache[attribute.targetField]) {
            choiceControls.forEach(function (control) {
                control.clearOptions();
                _choiceValueCache[attribute.targetField].forEach(function (choice) {
                    control.addOption(choice);
                });
            });
        }
        attribute.fieldSettings.forEach(function (set) {
            let sourceFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(attribute.sourceField));
            if (set.fieldValues.some(item => sourceFieldValueAsArray.includes(item))) {
                choiceControls.forEach(function (control) {
                    let options = JsLib.UI.Optionset.GetOptions(attribute.targetField);
                    let targetFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(attribute.targetField));
                    options.forEach(function (choiceValue) {
                        if (targetFieldValueAsArray.length > 0 && targetFieldValueAsArray.includes(choiceValue.value.toString()) && attribute.showAlwaysCurrentValue && !(isOnChange && attribute.clearChildValueOnParentChange)) {
                            return;
                        } else if (choiceValue && !set.choiceValuesToShow.includes(choiceValue.value.toString())) {
                            control.removeOption(choiceValue.value);
                        }
                    });
                });
            }
            if (JsLib.UI.Field.GetValue(attribute.targetField) && isOnChange && attribute.clearChildValueOnParentChange) {
                JsLib.UI.Field.SetValue(attribute.targetField, null);
                JsLib.UI.Field.TriggerOnChange(attribute.targetField);
            }
        });
    };

    /**
    * Validates component settings and adds default values
    * @param {Object} attribute One setting from Settings array
    * @param {Object} component Details of the component
    */
    const ValidateSettingHideChoiceValuesIfNotCurrentValue = async function (attribute, component) {
        if (JsLib.Helper.IsNullOrUndefined(attribute.targetField)) {
            throw fmfi.JsComponents.Helpers.Common.CreateError("targetField missing from Settings JSON", component);
        }

        if (JsLib.Helper.IsNullOrUndefined(attribute.choiceValuesToHide) || attribute.choiceValuesToHide.length <= 0) {
            throw fmfi.JsComponents.Helpers.Common.CreateError(attribute.targetField + " choiceValuesToHide parameter is missing or empty from Settings JSON", component);
        } else {
            attribute.choiceValuesToHide = attribute.choiceValuesToHide.map(a => JsLib.Helper.RemoveParenthesisFromGUID(a.toString()).toLowerCase());
        }
    };

    /**
     * Hides choice value provided in settings if its not fields current value
     * @param {Object} attribute One setting from Settings array 
     */
    const HideChoiceValuesIfNotCurrentValue = async function (attribute) {
        const choiceControls = JsLib.UI.Field.GetField(attribute.targetField, true)?.controls;
        choiceControls.forEach(function (control) {
            attribute.choiceValuesToHide.forEach(function (choiceValue) {
                let targetFieldValueAsArray = fmfi.JsComponents.Helpers.Common.ConvertFieldValueToStringArray(JsLib.UI.Field.GetValue(attribute.targetField));
                if (choiceValue && (targetFieldValueAsArray.length === 0 || !targetFieldValueAsArray.includes(choiceValue.toString()))) {
                    control.removeOption(Number(choiceValue));
                }
            });
        });
    };

    return {
        HideChoiceValuesIfNotCurrentValue: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.ChoiceManipulator.HideChoiceValuesIfNotCurrentValue.OnLoad.
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "ChoiceManipulator.HideChoiceValuesIfNotCurrentValue",
                    JSONModel: '[{"targetField":"FIELD_SCHEMA_NAME", "choiceValuesToHide": ["CHOICE_VALUE"]}]'
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                settings.forEach(function (attribute) {
                    ValidateSettingHideChoiceValuesIfNotCurrentValue(attribute);
                    HideChoiceValuesIfNotCurrentValue(attribute);
                });
            }
        },
        ShowChoiceValuesBasedOnFieldValue: {
            /**
            * Adds OnChange listeners to the sourceFields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.ChoiceManipulator.ShowChoiceValuesBasedOnFieldValue.OnLoad.
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "ChoiceManipulator.ShowChoiceValuesBasedOnFieldValue",
                    JSONModel: '[{"sourceField": "FIELD_SCHEMA_NAME", "targetField":"FIELD_SCHEMA_NAME", "fieldSettings": [{"fieldValues": ["FIELD_VALUE"], "choiceValuesToShow": ["CHOICE_VALUE"]}], "showAlwaysCurrentValue": true, "clearChildValueOnParentChange": true }]'
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);
                settings.forEach(function (attribute) {
                    ValidateSettingShowChoiceValuesBasedOnFieldValue(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute.sourceField, function () {
                        ShowChoiceValuesBasedOnFieldValue(attribute, true);
                    });
                    ShowChoiceValuesBasedOnFieldValue(attribute, false);
                });
            }
        }
    };
}();

/**
 * Contains configurable functions to run Power Automate Flows 
 */
fmfi.JsComponents.RunFlow = fmfi.JsComponents.RunFlow || function () {
    const _RunFlowActionName = "fmfi_ExecuteHttpTriggerPowerAutomateFlow";
    let gridControl;

    /**
     * Run flow by calling Dataverse action and waits for the answer
     * @param {*} attribute One field from Settings array
     * @param {*} selectedRecordRefs When calling from grid, selected record references
     */
    const RunFlowAndWaitAnswer = function (attribute, selectedRecordRefs) {
        JsLib.Helper.ShowProgressBar(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ProgressBar"));
        let body = {
            userid: JsLib.Helper.RemoveParenthesisFromGUID(JsLib.CurrentUser.GetUserID()),
            extra: attribute.extra
        };

        if (!JsLib.Helper.IsNullOrUndefined(selectedRecordRefs)) {
            body.recordidarray = selectedRecordRefs.map(({ Id }) => Id);
        } else {
            body.recordid = JsLib.Helper.RemoveParenthesisFromGUID(JsLib.Record.GetId());
        }

        if (!JsLib.Helper.IsNullOrUndefined(gridControl)) {
            body.tablename = gridControl.getEntityName();
        } else {
            body.tablename = JsLib.Record.GetEntityName();
        }

        let ActionParameters = [
            {
                name: "ConfigurationRowName",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: attribute.configurationRowName,
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE
            },
            {
                name: "Body",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: JSON.stringify(body),
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE
            }
        ];

        if (!JsLib.Helper.IsNullOrUndefined(attribute.configurationTable)) {
            ActionParameters.push({
                name: "ConfigurationTable",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: attribute.configurationTable,
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE
            });
        }

        JsLib.WebAPI.Requests.ExecuteAction(_RunFlowActionName, undefined, undefined, ActionParameters, function (response) {
            if (JsLib.Helper.IsNullOrUndefined(response) || !response.ok) {
                ProcessErrorResponse(response);
                return;
            }

            response.json().then(function (responseBody) {
                let respObj;
                if (JsLib.Helper.IsNullOrUndefined(responseBody) || JsLib.Helper.IsNullOrUndefined(responseBody.Message)) {
                    ProcessErrorResponse(response);
                    return;
                }

                try {
                    respObj = JSON.parse(responseBody.Message);
                } catch (error) {
                    ProcessErrorResponse(error);
                    return;
                }

                if (JsLib.Helper.IsNullOrUndefined(respObj)) {
                    ProcessErrorResponse(response);
                    return;
                }

                ProcessSuccessResponse(respObj ?? {});

            });
        }, ProcessErrorResponse);
    };

    /**
     * Handles success response from action/flow
     * @param {*} response 
     * @returns early if handled error
     */
    const ProcessSuccessResponse = function (response) {
        let success = response.success ?? response.Success ?? true;
        let message = response.message ?? response.Message;
        let table = response.tablename ?? response.tableName ?? response.table ?? response.Table ?? response.Entity ?? response.entity;
        let rowId = response.recordid ?? response.RowGuid ?? response.Rowguid ?? response.rowGuid ?? response.rowguid ?? response.recordId ?? response.recordID;

        if (success === "False" || success === "false" || success === false) {
            let errorResponse = { message: message ?? JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.DefaultError") };
            ProcessErrorResponse(errorResponse);
            return;
        }

        let alertDimensions = fmfi.JsComponents.Helpers.Common.CalculateDialogDimension(message);

        JsLib.Helper.CloseProgressBar();

        if (!JsLib.Helper.IsNullOrUndefined(message) && !JsLib.Helper.IsNullOrUndefined(table) && !JsLib.Helper.IsNullOrUndefined(rowId)) {
            // Flow returned message, table and rowId
            JsLib.UI.Dialogue.ShowAlert(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ResponseHeader"),
                JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Ok"), message, alertDimensions.height, alertDimensions.width, function () {
                    JsLib.UI.Form.OpenFormExistingRecord(table, rowId);
                });
        }
        else if (!JsLib.Helper.IsNullOrUndefined(table) && !JsLib.Helper.IsNullOrUndefined(rowId)) {
            // Flow returned table and rowId
            JsLib.UI.Form.OpenFormExistingRecord(table, rowId);
        }
        else if (!JsLib.Helper.IsNullOrUndefined(executionContext)) {
            // Flow was started from form context
            JsLib.UI.Form.Refresh(false, function () {
                message = message ?? JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.DefaultSuccess");
                JsLib.UI.Dialogue.ShowAlert(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ResponseHeader"),
                    JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Ok"), message, alertDimensions.height, alertDimensions.width);
            }, function () { });
        }
        else if (!JsLib.Helper.IsNullOrUndefined(gridControl)) {
            //Flow was started from grid context
            gridControl.refresh();
            message = message ?? JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.DefaultSuccess");
            JsLib.UI.Dialogue.ShowAlert(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ResponseHeader"),
                JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Ok"), message, alertDimensions.height, alertDimensions.width);
        }
        else {
            //Fall-back
            message = message ?? JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.DefaultSuccess");
            JsLib.UI.Dialogue.ShowAlert(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ResponseHeader"),
                JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Ok"), message, alertDimensions.height, alertDimensions.width);
        }
    };

    /**
     * Handles error response from action/flow
     * @param {*} response 
     */
    const ProcessErrorResponse = function (response) {
        JsLib.Helper.CloseProgressBar();
        JsLib.UI.Dialogue.ShowAlert(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Error"),
            JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.Ok"), response.message ?? response);
    };

    return {
        FormOnFieldValueChange: {
            /**
            * Adds OnChange listeners to the fields and runs logic
            * 
            * Form OnLoad event. This is the ONLY event you should call from your form.
            * Full namespace is required when called via form: fmfi.JsComponents.RunFlow.FormOnFieldValueChange.OnLoad
            * Remember to pass the execution context.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Settings JSON from "Comma separated list of parameters that will be passed to the function"-box in string format. Settings schema should follow component.JSONModel schema.
            */
            OnLoad: async function (initExecutionContext, settingsJSON) {
                const component = {
                    name: "RunFlow.FormOnFieldValueChange",
                    JSONModel: '[{"targetField":"FIELD_SCHEMA_NAME", "configurationTable": "CONFIGURATION_TABLE_NAME", "configurationRowName": "CONFIGURATION_ROW_NAME", "askConfirmation": true , "confirmationText": "CONFIRMATION_TEXT", "extra": "EXTRA"}]'
                };

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationRowName)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("configurationRowName missing from Settings the JSON", component);
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationTable)) {
                        attribute.configurationTable = null;
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.confirmationText)) {
                        attribute.confirmationText = JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationText");
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.askConfirmation)) {
                        attribute.askConfirmation = true;
                    }
                };

                if (!initExecutionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass execution context as first parameter"!', component);
                executionContext = initExecutionContext;
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must add settings JSON to "Comma separated list of parameters that will be passed to the function"-box!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let settings = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                settings.forEach(function (attribute) {
                    ValidateSetting(attribute);
                    JsLib.UI.Listeners.Field.RegisterOnChangeEvent(attribute.targetField, function () {
                        JsLib.UI.Field.SetSubmitMode(attribute.targetField, JsLib.Enums.Field_SubmitModes.ALWAYS);
                        JsLib.Record.Save(undefined, function () {
                            JsLib.UI.Field.SetSubmitMode(attribute.targetField, JsLib.Enums.Field_SubmitModes.DIRTY);
                            if (attribute.askConfirmation) {
                                JsLib.UI.Dialogue.ShowConfirmation(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationHeader"),
                                    JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "Yes"),
                                    JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "No"), attribute.confirmationText, function (result) {
                                        if (!result.confirmed) return;
                                        try {
                                            RunFlowAndWaitAnswer(attribute);
                                        } catch (error) {
                                            ProcessErrorResponse(error);
                                        }
                                    });
                            } else {
                                try {
                                    RunFlowAndWaitAnswer(attribute);
                                } catch (error) {
                                    ProcessErrorResponse(error);
                                }
                            }
                        }, function () { });
                    });
                });
            }
        },
        Ribbon: {
            /**
            * Run flow on form ribbon context
            * 
            * Ribbon button command
            * Full namespace is required when called via form: fmfi.JsComponents.RunFlow.Ribbon.FormRunFlow
            * Remember to add command parameters.
            * 
            * @param {*} initExecutionContext Execution context
            * @param {String} settingsJSON Commands second parameter Settings JSON. Settings schema should follow component.JSONModel schema.
            */
            FormRunFlow: async function (initFormContext, settingsJSON) {
                const component = {
                    name: "RunFlow.FormRunFlow",
                    JSONModel: '{"configurationTable": "CONFIGURATION_TABLE_NAME", "configurationRowName": "CONFIGURATION_ROW_NAME", "askConfirmation": true , "confirmationText": "CONFIRMATION_TEXT", "extra": "EXTRA"}'
                };

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationRowName)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("configurationRowName missing from Settings the JSON", component);
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationTable)) {
                        attribute.configurationTable = null;
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.confirmationText)) {
                        attribute.confirmationText = JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationText");
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.askConfirmation)) {
                        attribute.askConfirmation = true;
                    }
                };
                executionContext = initFormContext;
                if (!executionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass Primary control as first parameter"!', component);

                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass settings JSON as second parameter!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let attribute = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                ValidateSetting(attribute);
                JsLib.Record.Save(undefined, function () {
                    if (attribute.askConfirmation) {
                        JsLib.UI.Dialogue.ShowConfirmation(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationHeader"),
                            JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "Yes"),
                            JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "No"), attribute.confirmationText, function (result) {
                                if (!result.confirmed) return;
                                try {
                                    RunFlowAndWaitAnswer(attribute);
                                } catch (error) {
                                    ProcessErrorResponse(error);
                                }
                            });
                    } else {
                        try {
                            RunFlowAndWaitAnswer(attribute);
                        } catch (error) {
                            ProcessErrorResponse(error);
                        }
                    }
                }, function () { });
            },
            /**
            * Run flow on subgrid context
            * 
            * Ribbon button command
            * Full namespace is required when called via form: fmfi.JsComponents.RunFlow.Ribbon.SubGridRunFlow
            * Remember to add command parameters.
            * 
            * @param {*} initExecutionContext Primary control
            * @param {*} selectedRecordRefs Selected record references
            * @param {String} settingsJSON  Settings JSON. Settings schema should follow component.JSONModel schema.
            */
            SubGridRunFlow: async function (initFormContext, selectedRecordRefs, settingsJSON) {
                const component = {
                    name: "RunFlow.FormRunFlow",
                    JSONModel: '{"configurationTable": "CONFIGURATION_TABLE_NAME", "configurationRowName": "CONFIGURATION_ROW_NAME", "askConfirmation": true , "confirmationText": "CONFIRMATION_TEXT", "extra": "EXTRA"}'
                };

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationRowName)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("configurationRowName missing from Settings the JSON", component);
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationTable)) {
                        attribute.configurationTable = null;
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.confirmationText)) {
                        attribute.confirmationText = JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationText");
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.askConfirmation)) {
                        attribute.askConfirmation = true;
                    }
                };
                executionContext = initFormContext;
                if (!executionContext)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass primary control as first parameter"!', component);
                if (!selectedRecordRefs)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass selectedRecordRefs as second parameter"!', component);
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass settings JSON as third parameter!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let attribute = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);


                ValidateSetting(attribute);

                JsLib.Record.Save(undefined, function () {
                    if (attribute.askConfirmation) {
                        JsLib.UI.Dialogue.ShowConfirmation(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationHeader"),
                            JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "Yes"),
                            JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "No"), attribute.confirmationText, function (result) {
                                if (!result.confirmed) return;
                                try {
                                    RunFlowAndWaitAnswer(attribute, selectedRecordRefs);
                                } catch (error) {
                                    ProcessErrorResponse(error);
                                }
                            });
                    } else {
                        try {
                            RunFlowAndWaitAnswer(attribute, selectedRecordRefs);
                        } catch (error) {
                            ProcessErrorResponse(error);
                        }
                    }
                }, function () { });

            },
            /**
            * Run flow on grid ribbon context
            * 
            * Ribbon button command
            * Full namespace is required when called via form: fmfi.JsComponents.RunFlow.Ribbon.GridRunFlow
            * Remember to add command parameters.
            * 
            * @param {*} initGridControl Primary control
            * @param {*} selectedRecordRefs Selected record reference
            * @param {String} settingsJSON Settings JSON. Settings schema should follow component.JSONModel schema.
            */
            GridRunFlow: async function (initGridControl, selectedRecordRefs, settingsJSON) {
                const component = {
                    name: "RunFlow.FormRunFlow",
                    JSONModel: '{"configurationTable": "CONFIGURATION_TABLE_NAME", "configurationRowName": "CONFIGURATION_ROW_NAME", "askConfirmation": true , "confirmationText": "CONFIRMATION_TEXT", "extra": "EXTRA"}'
                };

                /**
                * Validates component settings and adds default values
                * @param {Object} attribute One setting from Settings array
                */
                const ValidateSetting = function (attribute) {
                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationRowName)) {
                        throw fmfi.JsComponents.Helpers.Common.CreateError("configurationRowName missing from Settings the JSON", component);
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.configurationTable)) {
                        attribute.configurationTable = null;
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.confirmationText)) {
                        attribute.confirmationText = JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationText");
                    }

                    if (JsLib.Helper.IsNullOrUndefined(attribute.askConfirmation)) {
                        attribute.askConfirmation = true;
                    }
                };
                gridControl = initGridControl;


                if (!gridControl)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass Primary Control as first parameter"!', component);
                if (!selectedRecordRefs)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass selectedRecordRefs as second parameter"!', component);
                if (!settingsJSON)
                    throw fmfi.JsComponents.Helpers.Common.CreateError('You must "Pass settings JSON as third parameter!', component);
                if (!JsLib) {
                    await fmfi.JsComponents.Helpers.JSLIBLoader.Load();
                }
                let attribute = fmfi.JsComponents.Helpers.Common.ParseSettings(settingsJSON, component.JSONModel);

                ValidateSetting(attribute);

                if (attribute.askConfirmation) {
                    JsLib.UI.Dialogue.ShowConfirmation(JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "RunFlow.ConfirmationHeader"),
                        JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "Yes"),
                        JsLib.Helper.GetWebresourceLocalizedString(fmfi.JsComponents._LocalizationFileName, "No"), attribute.confirmationText, function (result) {
                            if (!result.confirmed) return;
                            try {
                                RunFlowAndWaitAnswer(attribute, selectedRecordRefs);
                            } catch (error) {
                                ProcessErrorResponse(error);
                            }

                        });
                } else {
                    try {
                        RunFlowAndWaitAnswer(attribute, selectedRecordRefs);
                    } catch (error) {
                        ProcessErrorResponse(error);
                    }
                }
            }
        }
    };
}();