/// Make sure you reference your full library here correctly so that your VS intelligence works. If path below is not correct then fix it according to your project.
/// <reference path="../source/fmfi.PowerPlatform.DeveloperToolkit.JsLib.js" />

// Default namespace is quite long so we can cut it short.
var JsLib = fmfi?.PowerPlatform?.DeveloperToolkit.JsLib;
const JsLibMinPath = "/WebResources/fmfi_/Fellowmind.PowerPlatform.DeveloperToolkit.JS/fmfi.PowerPlatform.DeveloperToolkit.JsLib.min.js";

// Define the global execution context that the library requires and initialize it in the form OnLoad event.
var executionContext;

// Namespacing used in the entitys form. Replace the placeholder 'EntityName' with your entity.
var fmfi = window.fmfi || {}; 
fmfi.JsLibrary = fmfi.JsLibrary || function () {

    ///////////////////////////////////////////////////////////////////
    /// Private variables/functions common to all public interfaces ///
    ///////////////////////////////////////////////////////////////////

    var registerOnChangeEvents = function () {
        // <summary>
        // Adds listeners for the defined fields that will be triggered during OnChange event.
        // </summary>
        
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_createanewrecordinputtext", fmfi.JsLibrary.Form.fmfi_createanewrecordinputtextOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_updateexistingrecordnameoftherecord", fmfi.JsLibrary.Form.fmfi_updateexistingrecordnameoftherecordOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_updateexistingrecordnewnameoftherecord", fmfi.JsLibrary.Form.fmfi_updateexistingrecordnewnameoftherecordOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_deleteexistingrecords", fmfi.JsLibrary.Form.fmfi_deleteexistingrecordsOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_showprogressbar", fmfi.JsLibrary.Form.fmfi_showprogressbarOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_retrieveenvironmentvariable", fmfi.JsLibrary.Form.fmfi_retrieveEnvironmentVariableOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_lockfieldsonform", fmfi.JsLibrary.Form.fmfi_lockfieldsonformOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_locksinglefield", fmfi.JsLibrary.Form.fmfi_locksinglefieldOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_lockfieldsonsection", fmfi.JsLibrary.Form.fmfi_lockfieldsonsectionOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_lockfieldsontab", fmfi.JsLibrary.Form.fmfi_lockfieldsontabOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_hidesections", fmfi.JsLibrary.Form.fmfi_hidesectionsOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_hidetabs", fmfi.JsLibrary.Form.fmfi_hidetabsOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_executeaction", fmfi.JsLibrary.Form.fmfi_executeactionOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_executehttpreq", fmfi.JsLibrary.Form.fmfi_executehttpreqOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_removesingleoption", fmfi.JsLibrary.Form.fmfi_removesingleoptionOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_removealloptions", fmfi.JsLibrary.Form.fmfi_removealloptionsOnChange);
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_executeunboundaction", fmfi.JsLibrary.Form.fmfi_executeunboundactionOnChange)
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_prefilterlookupnamesearch", fmfi.JsLibrary.Form.fmfi_prefilterlookupnamesearchOnChange);        
    }

    var LoadDependentLibraries = function (libPath) {
        // <summary>
        // Loads dependent JS library so that it doesn't need to be referred in the header
        // </summary>

        return new Promise(function (resolve, reject) {
            var scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = libPath;
            scriptTag.async = false;
            scriptTag.onload = function () { return resolve(); };
            document.head.appendChild(scriptTag);
        });
       
    }

    var createNewExampleRecord = function (name) {
        // <summary>
        // Creates new example record and reloads the data on the form.
        // </summary>

        var data =
        {
            "fmfi_name": name,
            "fmfi_showcasejslibraryid@odata.bind": "/fmfi_showcasejslibraryrows(" + JsLib.Record.GetId(true) + ")",            
        }

        JsLib.Helper.ShowProgressBar("Creating record, please wait...");
       
        JsLib.WebAPI.CRUD.Create("fmfi_showcasejslibraryrow", data, function (record) {            
            JsLib.UI.Grid.Refresh("grid_ExampleRecords");     
            JsLib.UI.Notification.ShowFormNotification("New example record created: " + record.entityType + ", " + record.id, JsLib.Enums.FormNotification_Type.INFO, 10);   
            JsLib.UI.Field.SetValue("fmfi_createanewrecordinputtext", "");
            JsLib.Helper.CloseProgressBar();
        }, function (err) {
            JsLib.UI.Notification.ShowFormNotification("Error occurred when creating new example record: " + err.errorCode + ", " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);    
            JsLib.Helper.CloseProgressBar();
        });
    }

    var updateExistingExampleRecords = function (searchName, newName) {
        // <summary>
        // Updates existing example records and refresh the data on the form.
        // </summary>

        JsLib.Helper.ShowProgressBar("Updating record(s), please wait...");

        var data =
        {
            "fmfi_name": newName,            
        }

        var options = "?$select=fmfi_showcasejslibraryrowid&$filter=fmfi_name eq '" + searchName + "' and _fmfi_showcasejslibraryid_value eq " + JsLib.Record.GetId(true) + "";

        JsLib.WebAPI.CRUD.UpdateMultiple("fmfi_showcasejslibraryrow", options, data, function () {
            JsLib.UI.Grid.Refresh("grid_ExampleRecords");     
            JsLib.UI.Notification.ShowFormNotification("All example records updated successfully.", JsLib.Enums.FormNotification_Type.INFO, 10);
            JsLib.UI.Field.SetValue("fmfi_updateexistingrecordnameoftherecord", "");
            JsLib.UI.Field.SetValue("fmfi_updateexistingrecordnewnameoftherecord", "");
            JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnameoftherecord", true);
            JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnewnameoftherecord", false);
            JsLib.Helper.CloseProgressBar();
        }, function (err) {
            JsLib.UI.Notification.ShowFormNotification("Error occurred when updating example records: " + err.errorCode + ", " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
            JsLib.Helper.CloseProgressBar();
        });        
    }

    var deleteExistingExampleRecords = function (records) {
        // <summary>
        // Deletes existing example records and refresh the data on the form.
        // </summary>

        JsLib.Helper.ShowProgressBar("Deleting record(s), please wait...");        

        for (var i = 0; i < records.length; i++) {
            JsLib.WebAPI.CRUD.Delete("fmfi_showcasejslibraryrow", records[i].fmfi_showcasejslibraryrowid, function () {
                JsLib.Logger.Info("Record deleted.");
            }, function (err) {
                JsLib.UI.Notification.ShowFormNotification("Error occurred when deleting example records: " + err.errorCode + ", " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
            });
        }

        JsLib.Helper.CloseProgressBar();
        JsLib.UI.Notification.ShowFormNotification("All example records deleted successfully.", JsLib.Enums.FormNotification_Type.INFO, 10);
        JsLib.UI.Grid.Refresh("grid_ExampleRecords");
    }    

    var runEntityBoundAction = function () {
        // <summary>
        // Executes entity bound action and waits for it to finish. After finish shows output parameter value.
        // </summary                

        var actionName = "fmfi_ActionShowcaseJSLibraryexample";
        var entityName = JsLib.Record.GetEntityName();
        var entityId = JsLib.Record.GetId(true);
        var params = [
            {
                name: "PARAM_IN_UserName",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: JsLib.CurrentUser.GetUserName(),
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE,
            }
        ];

        JsLib.Helper.ShowProgressBar("Triggering action '" + actionName + "', please wait...");

        JsLib.WebAPI.Requests.ExecuteAction(actionName, entityName, entityId, params, function (result) {

            result.json().then(function (response) {
                var message = response.PARAM_OUT_Response;
                JsLib.UI.Field.SetValue("fmfi_executeaction", false);
                JsLib.UI.Notification.ShowFormNotification(message, JsLib.Enums.FormNotification_Type.INFO, 10);
                JsLib.Helper.CloseProgressBar();                
            });            

        }, function (err) {
            JsLib.UI.Field.SetValue("fmfi_executeaction", false);
            JsLib.UI.Notification.ShowFormNotification("Error occurred when triggering action '" + actionName + "': " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
            JsLib.Helper.CloseProgressBar();
        });

    }

    var runMultipleEntityBoundActions = function (ids) {
        // <summary>
        // Executes multiple entity bound actions and waits for tem to finish. After finish shows output parameter value.
        // </summary                

        var actionName = "fmfi_ActionShowcaseJSLibraryexample";
        var entityName = JsLib.Record.GetEntityName();        
        var params = [
            {
                name: "PARAM_IN_UserName",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: JsLib.CurrentUser.GetUserName(),
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE,
            }
        ];

        JsLib.Helper.ShowProgressBar("Triggering action '" + actionName + "' for selected record count of " + ids.length + ", please wait...");

        JsLib.WebAPI.Requests.ExecuteMultipleActions(actionName, entityName, ids, params, function (result) {

            result.json().then(function (response) {
                var message = response.PARAM_OUT_Response;                
                JsLib.UI.Notification.ShowFormNotification(message, JsLib.Enums.FormNotification_Type.INFO, 10);
                JsLib.Helper.CloseProgressBar();
            });

        }, function (err) {            
            JsLib.UI.Notification.ShowFormNotification("Error occurred when triggering action '" + actionName + "': " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
            JsLib.Helper.CloseProgressBar();
        });

    }

    var runUnBoundAction = function () {
        // <summary>
        // Executes unbound action and waits for it to finish. After finish shows output parameter value.
        // </summary                

        var actionName = "fmfi_UnboundActionShowcaseJSLibraryexample";        
        var params = [
            {
                name: "PARAM_IN_UserName",
                type: JsLib.Enums.EntityDataModel_PrimitiveType.STRING,
                value: JsLib.CurrentUser.GetUserName(),
                category: JsLib.Enums.EntityDataModel_StructuralType.PRIMITIVETYPE,
            }
        ];

        JsLib.Helper.ShowProgressBar("Triggering action '" + actionName + "', please wait...");
        
        JsLib.WebAPI.Requests.ExecuteAction(actionName, null, null, params, function (result) {

            result.json().then(function (response) {
                var message = response.PARAM_OUT_Response;
                JsLib.UI.Field.SetValue("fmfi_executeunboundaction", false);
                JsLib.UI.Notification.ShowFormNotification(message, JsLib.Enums.FormNotification_Type.INFO, 10);
                JsLib.Helper.CloseProgressBar();
            });

        }, function (err) {
            JsLib.UI.Field.SetValue("fmfi_executeunboundaction", false);
            JsLib.UI.Notification.ShowFormNotification("Error occurred when triggering action '" + actionName + "': " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
            JsLib.Helper.CloseProgressBar();
        });
    }

    var executeHttpReq = function () {
        // <summary>
        // Executes a HTTP GET request
        // </summary

        var url = "https://httpbin.org/get";

        var headers = new Map();
        headers.set('Content-Type', 'application/json')

        JsLib.HTTP.GET(url, headers, "Please wait...", 200).then(function (response) {
            JsLib.UI.Field.SetValue("fmfi_executehttpreq", false);
            JsLib.UI.Notification.ShowFormNotification("HTTP GET request executed successfully to " + url, JsLib.Enums.FormNotification_Type.INFO, 10);
        }, function (errorMessage) {
            JsLib.UI.Field.SetValue("fmfi_executehttpreq", false);
            JsLib.UI.Notification.ShowFormNotification(errorMessage, JsLib.Enums.FormNotification_Type.ERROR, 10);
        });

    }   

    var setFieldsThatShouldNeverBeSaved = function () {
        // <summary>
        // Prevents certain fields to be never saved.
        // </summary>

        JsLib.UI.Field.SetSubmitMode("fmfi_createanewrecordinputtext", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_updateexistingrecordnameoftherecord", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_updateexistingrecordnewnameoftherecord", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_lockfieldsonform", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_locksinglefield", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_lockfieldsonsection", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_lockfieldsontab", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_hidesections", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_hidetabs", JsLib.Enums.Field_SubmitModes.NEVER);        
        JsLib.UI.Field.SetSubmitMode("fmfi_executeaction", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_executeunboundaction", JsLib.Enums.Field_SubmitModes.NEVER);
        JsLib.UI.Field.SetSubmitMode("fmfi_executehttpreq", JsLib.Enums.Field_SubmitModes.NEVER);
    }

    var checkIfUserIsAdmin = function () {
        // <summary>
        // Checks if the current user is admin.
        // </summary>

        if (!JsLib.CurrentUser.HasRole("System Administrator")) {
            JsLib.Logger.Info("User is not an admin.");
        }
        else {
            JsLib.Logger.Info("User is an admin.");
        }
            
    } 

    //////////////////////////////////////////////////////////////////
    /// Public interface                                           ///
    //////////////////////////////////////////////////////////////////

    return {

        Form: {
        // <summary>
        // Contains functions that are triggered from the form.
        // </summary

            OnLoad: function (initExecutionContext) {
                // <summary>
                /// Form OnLoad event. This is the ONLY event you should call from your form.
                /// Full namespace is required when called via form: fmfi.EntityName.Form.OnLoad.
                /// Remember to pass the execution context.
                /// </summary> 
                /// <param name="initExecutionContext" type="object" required="true" >
                /// Execution context
                /// </param>        
                
                // Load dependent libraries here
                Promise.all([LoadDependentLibraries(JsLibMinPath)]).then((results) => {

                    JsLib = fmfi.PowerPlatform.DeveloperToolkit.JsLib;

                    if (JsLib.Helper.IsNullOrUndefined(initExecutionContext))
                        throw "Form.OnLoad: parameter 'initExecutionContext' must be defined!";

                    // Initialize the global execution context that the library methods requires to function properly.
                    executionContext = initExecutionContext;

                    // Initialize listeners for field, form, tab, grid or BPF events here. 
                    if (executionContext.getEventArgs().getDataLoadState() == 1) 
                        registerOnChangeEvents();

                    // Never save the value in these fields
                    setFieldsThatShouldNeverBeSaved();

                    checkIfUserIsAdmin();

                    // By default lock these fields
                    if (JsLib.UI.Form.GetState() == JsLib.Enums.FormType.UNDEFINED || JsLib.UI.Form.GetState() == JsLib.Enums.FormType.CREATE) {
                        JsLib.UI.Field.SetFieldState("fmfi_createanewrecordinputtext", false);
                        JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnameoftherecord", false);
                        JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnewnameoftherecord", false);
                    }
                    else {
                        JsLib.UI.Field.SetFieldState("fmfi_createanewrecordinputtext", true);
                        JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnameoftherecord", true);                        
                    }                        
                });                
            },
            fmfi_prefilterlookupnamesearchOnChange: function () {
                // <summary>
                // Prefilters lookup with the text written into the search box.
                // </summary>
                
                JsLib.UI.Lookup.AddPreSearch("fmfi_prefilterlookup", fmfi.JsLibrary.Form.fmfi_prefilterlookupExecuteFilter);
            },
            fmfi_prefilterlookupExecuteFilter: function () {
                var fetchXML = "";
                var searchText = JsLib.UI.Field.GetValue("fmfi_prefilterlookupnamesearch");
                if (!JsLib.Helper.IsNullOrUndefined(searchText))
                    fetchXML = `<filter type='and'>
                                   <condition attribute='name' operator='like' value='${searchText}%'/>
                                </filter>
                               `;
                
                JsLib.UI.Lookup.AddCustomFilter(fetchXML, "fmfi_prefilterlookup", "account");
            },
            fmfi_createanewrecordinputtextOnChange: function () {
            // <summary>
            // Triggers the creation of a new example record.
            // </summary>

                var name = JsLib.UI.Field.GetValue("fmfi_createanewrecordinputtext");
                if (JsLib.Helper.IsNullOrUndefined(name))
                    return;
                
                if (JsLib.UI.Dialogue.ShowConfirmation("Create new record?", "Yes", "No", "Are you sure you want to create new example record '" + name + "'?",
                    function (success) {
                        if (success.confirmed)
                            createNewExampleRecord(name);
                    }, function () {
                        JsLib.UI.Notification.ShowFormNotification("An error occurred when creating new example record.", JsLib.Enums.FormNotification_Type.ERROR, 10);
                    }));
            },
            fmfi_updateexistingrecordnameoftherecordOnChange: function () {
            // <summary>
            // Triggers the search of existing example record(s).
            // </summary>

                var name = JsLib.UI.Field.GetValue("fmfi_updateexistingrecordnameoftherecord");
                if (JsLib.Helper.IsNullOrUndefined(name)) {
                    JsLib.UI.Field.SetValue("fmfi_updateexistingrecordnewnameoftherecord", "");
                    return;
                }                    

                var options = "?$select=fmfi_showcasejslibraryrowid&$filter=fmfi_name eq '" + name + "' and _fmfi_showcasejslibraryid_value eq " + JsLib.Record.GetId(true) + "";
                JsLib.WebAPI.CRUD.RetrieveMultiple("fmfi_showcasejslibraryrow", options, 5000, function (data) {

                    if (data.entities.length == 0) {
                        JsLib.UI.Notification.ShowFormNotification("No record(s) found with name '" + name + "'. Please provide exactly the same name that you wish to update.", JsLib.Enums.FormNotification_Type.WARNING, 10);
                        JsLib.UI.Field.SetValue("fmfi_updateexistingrecordnewnameoftherecord", "");
                        JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnewnameoftherecord", false);
                        return;
                    }

                    JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnameoftherecord", false);
                    JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnewnameoftherecord", true);
                    JsLib.UI.Notification.ShowFormNotification("Please provide new name for the record(s) to update.", JsLib.Enums.FormNotification_Type.INFO, 10);    

                }, function (err) {
                    JsLib.UI.Notification.ShowFormNotification("Error occurred when searching example records: " + err.errorCode + ", " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
                });                
            },
            fmfi_updateexistingrecordnewnameoftherecordOnChange: function () {
            // <summary>
            // Triggers the update of existing example record(s).
            // </summary>

                var newName = JsLib.UI.Field.GetValue("fmfi_updateexistingrecordnewnameoftherecord");
                var searchName = JsLib.UI.Field.GetValue("fmfi_updateexistingrecordnameoftherecord");
                if (JsLib.Helper.IsNullOrUndefined(newName)) {
                    JsLib.UI.Field.SetFieldState("fmfi_updateexistingrecordnewnameoftherecord", false);
                    return;
                }                 

                if (JsLib.UI.Dialogue.ShowConfirmation("Update existing records?", "Yes", "No", "Are you sure you want to update existing example records '" + searchName + "' to '" + newName + "'?",
                    function (success) {
                        if (success.confirmed)
                            updateExistingExampleRecords(searchName, newName);
                    }, function () {
                        JsLib.UI.Notification.ShowFormNotification("An error occurred when updating example records.", JsLib.Enums.FormNotification_Type.ERROR, 10);
                }));                
            },
            fmfi_deleteexistingrecordsOnChange: function () {
            // <summary>
            // Triggers the deletion of existing example record(s).
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_deleteexistingrecords") != true)
                    return;

                var options = "?$select=fmfi_showcasejslibraryrowid&$filter=_fmfi_showcasejslibraryid_value eq " + JsLib.Record.GetId(true) + "";
                JsLib.WebAPI.CRUD.RetrieveMultiple("fmfi_showcasejslibraryrow", options, 5000, function (data) {

                    if (data.entities.length == 0) {
                        JsLib.UI.Notification.ShowFormNotification("No record(s) found for deletion.", JsLib.Enums.FormNotification_Type.WARNING, 10);      
                        JsLib.UI.Field.SetValue("fmfi_deleteexistingrecords", false);
                        return;
                    }

                    if (JsLib.UI.Dialogue.ShowConfirmation("Delete existing records?", "Yes", "No", "Are you sure you want to delete existing example records?",
                        function (success) {
                            if (success.confirmed)
                                deleteExistingExampleRecords(data.entities);

                            JsLib.UI.Field.SetValue("fmfi_deleteexistingrecords", false);
                        }, function () {
                            JsLib.UI.Notification.ShowFormNotification("An error occurred when deleting example records.", JsLib.Enums.FormNotification_Type.ERROR, 10);
                    }));

                }, function (err) {
                    JsLib.UI.Notification.ShowFormNotification("Error occurred when searching example records: " + err.errorCode + ", " + err.message, JsLib.Enums.FormNotification_Type.ERROR, 10);
                });
            },
            fmfi_showprogressbarOnChange: function () {
            // <summary>
            // Triggers progress bar example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_showprogressbar") != true)
                    return;

                JsLib.Helper.ShowProgressBar("This progressbar will be visible for 5 seconds.");

                setTimeout(function () {
                    JsLib.Helper.CloseProgressBar();
                    JsLib.UI.Field.SetValue("fmfi_showprogressbar", false);
                }, 5000);                
            },
            fmfi_retrieveEnvironmentVariableOnChange: function () {
            // <summary>
            // Triggers retrieval of environment variable example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_retrieveenvironmentvariable") != true)
                    return;

                var name = "fmfi_JsLibEnvironmentVariable";                

                JsLib.Helper.GetEnvironmentVariable(name, function (data) {
                    JsLib.UI.Notification.ShowFormNotification("Value of the environment variable '" + name + "' is: " + data.value, JsLib.Enums.FormNotification_Type.INFO, 10);
                    JsLib.UI.Field.SetValue("fmfi_retrieveenvironmentvariable", false);
                }, function (err) {
                    JsLib.UI.Notification.ShowFormNotification("Error occurred when retrieving environment variable '" + name + "': " + err, JsLib.Enums.FormNotification_Type.ERROR, 10);
                    JsLib.UI.Field.SetValue("fmfi_retrieveenvironmentvariable", false);
                });
            },
            fmfi_lockfieldsonformOnChange: function () {
            // <summary>
            // Triggers lock all fields on a form example.
            // </summary>

                var areLocked = JsLib.UI.Field.GetValue("fmfi_lockfieldsonform");
                JsLib.UI.Form.SetFormFieldsState(!areLocked, "fmfi_lockfieldsonform");                
            },
            fmfi_locksinglefieldOnChange: function () {
            // <summary>
            // Triggers lock single field example.
            // </summary>

                var isLocked = JsLib.UI.Field.GetValue("fmfi_locksinglefield");
                JsLib.UI.Field.SetFieldState("fmfi_fieldtolock", !isLocked);
            },
            fmfi_lockfieldsonsectionOnChange: function () {              
            // <summary>
            // Triggers lock fields inside a section example.
            // </summary>

                var areLocked = JsLib.UI.Field.GetValue("fmfi_lockfieldsonsection");
                JsLib.UI.Section.SetSectionFieldsState("tab_UI", "tab_UI_section_Section", !areLocked, "fmfi_lockfieldsonsection");
            },
            fmfi_lockfieldsontabOnChange: function () {
            // <summary>
            // Triggers lock fields inside a tab example.
            // </summary>

                var areLocked = JsLib.UI.Field.GetValue("fmfi_lockfieldsontab");
                JsLib.UI.Tab.SetTabFieldsState("tab_UI", !areLocked, "fmfi_lockfieldsontab");
            },
            fmfi_hidesectionsOnChange: function () {
            // <summary>
            // Triggers hide section example.
            // </summary>

                var hide = JsLib.UI.Field.GetValue("fmfi_hidesections");
                JsLib.UI.Section.SetVisibility("tab_UI", "tab_UI_section_Field", !hide);
                JsLib.UI.Section.SetVisibility("tab_UI", "tab_UI_section_Tab", !hide);
                JsLib.UI.Section.SetVisibility("tab_UI", "tab_UI_section_Form", !hide);
                JsLib.UI.Section.SetVisibility("tab_UI", "tab_UI_section_Optionset", !hide);
                JsLib.UI.Section.SetVisibility("tab_UI", "tab_UI_section_CustomPage", !hide);                
            },
            fmfi_hidetabsOnChange: function () {
            // <summary>
            // Triggers hide tab example.
            // </summary>

                var hide = JsLib.UI.Field.GetValue("fmfi_hidetabs");
                JsLib.UI.Tab.SetVisibility("tab_WebAPI", !hide);
                //JsLib.UI.Tab.SetVisibility("tab_PowerAutomate", !hide);
                JsLib.UI.Tab.SetVisibility("tab_HTTP", !hide);
                JsLib.UI.Tab.SetVisibility("tab_Helper", !hide);
                //JsLib.UI.Tab.SetVisibility("tab_Record", !hide);
                //JsLib.UI.Tab.SetVisibility("tab_Context", !hide);
            },
            fmfi_executeactionOnChange: function () {
            // <summary>
            // Triggers execute entity bound action example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_executeaction") != true)
                    return;

               runEntityBoundAction();
            },
            fmfi_executeunboundactionOnChange: function () {
            // <summary>
            // Triggers execute unbound action example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_executeunboundaction") != true)
                    return;

                runUnBoundAction();
            },
            fmfi_executehttpreqOnChange: function () {
            // <summary>
            // Triggers execute workflow example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_executehttpreq") != true)
                    return

                executeHttpReq();
            },
            fmfi_removesingleoptionOnChange: function () {
             // <summary>
            // Triggers remove single optionset value example.
            // </summary>                

                if (JsLib.UI.Field.GetValue("fmfi_removesingleoption") == true) {
                    JsLib.UI.Optionset.RemoveOption("fmfi_exampleoptionset", 4);
                }
                else {
                    JsLib.UI.Optionset.AddOption("fmfi_exampleoptionset", 4, "Option D", 4);
                }

            },
            fmfi_removealloptionsOnChange: function () {
            // <summary>
            // Triggers remove all optionset values example.
            // </summary>

                if (JsLib.UI.Field.GetValue("fmfi_removealloptions") == true) {                    
                    JsLib.UI.Optionset.RemoveOptions("fmfi_exampleoptionset");
                }
                else {
                    JsLib.UI.Optionset.AddOption("fmfi_exampleoptionset", 1, "Option A", 1);
                    JsLib.UI.Optionset.AddOption("fmfi_exampleoptionset", 2, "Option B", 2);
                    JsLib.UI.Optionset.AddOption("fmfi_exampleoptionset", 3, "Option C", 3);
                    JsLib.UI.Optionset.AddOption("fmfi_exampleoptionset", 4, "Option D", 4);
                }
            }
        },
        Ribbon: {
            ExecuteMultipleEntityBoundActions: function (ids) {
            // <summary>
            // Triggers execution of multiple actions for the selected subgrid items.
            // </summary>

                if (JsLib.UI.Dialogue.ShowConfirmation("Execute action for the selected records?", "Yes", "No", "Are you sure you want to do this?",
                    function (success) {
                        if (success.confirmed)
                            runMultipleEntityBoundActions(ids);      
                    }, function () {
                    JsLib.UI.Notification.ShowFormNotification("An error occurred. Please contact system administrator.", JsLib.Enums.FormNotification_Type.ERROR, 10);
                }));
            }
        }
    };
}();

