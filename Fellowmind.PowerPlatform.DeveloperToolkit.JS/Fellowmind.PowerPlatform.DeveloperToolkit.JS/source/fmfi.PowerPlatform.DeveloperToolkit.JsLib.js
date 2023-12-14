//////////////////////////////////////////////////////////////////////////////////////////
/// Minify JS library by using https://skalman.github.io/UglifyJS-online/
//////////////////////////////////////////////////////////////////////////////////////////

var fmfi = fmfi || {};
fmfi.PowerPlatform = fmfi.PowerPlatform || {};
fmfi.PowerPlatform.DeveloperToolkit = fmfi.PowerPlatform.DeveloperToolkit || {};
fmfi.PowerPlatform.DeveloperToolkit.JsLib = fmfi.PowerPlatform.DeveloperToolkit.JsLib || {};

//////////////////////////////////////////////////////////////////////////////////////////
/// Web API
/// https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI = fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Private variables and functions 
    ///////////////////////////////////////////////////////////////////////////////////////

    var globalContext = Xrm.Utility.getGlobalContext();

    var isNullOrUndefined = function (param) {
        /// <summary>
        /// Checks if the given parameter is either null or undefined.
        /// </summary>
        if (typeof param === 'undefined' || param === null)
            return true;

        return false;
    };

    var defineObjectProperty = function (obj, propertyName, propertyValue) {
        var config = {
            value: propertyValue,
            writable: true,
            enumerable: true,
            configurable: true
        };
        Object.defineProperty(obj, propertyName, config);
    };

    var getRequestParameterTypes = function (boundEntity, parameters) {

        var requestParameterTypes = {};

        if (parameters && parameters.length > 0) {
            parameters.forEach(function (param) {
                defineObjectProperty(requestParameterTypes,
                    param.name,
                    {
                        "typeName": param.type,
                        "structuralProperty": param.category
                    });
            });
        }

        if (boundEntity) {
            defineObjectProperty(requestParameterTypes,
                "entity",
                {
                    "typeName": "mscrm." + boundEntity.entityLogicalName,
                    "structuralProperty": fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.EntityDataModel_StructuralType.ENTITYTYPE
                });
        }

        return requestParameterTypes;
    };

    var generateRequest = function (actionName, requestType, parameters, entityName, id) {

        var request = {};
        var boundEntity = null;
        if (!isNullOrUndefined(entityName) && !isNullOrUndefined(id)) {
            boundEntity = {
                entityLogicalName: entityName,
                id: id
            };
        }
        request.getMetadata = function () {
            return {
                boundParameter: boundEntity === 'undefined' || boundEntity === null ? null : 'entity',
                parameterTypes: getRequestParameterTypes(boundEntity, parameters),
                operationType: requestType,
                operationName: actionName,
            };
        };

        if (boundEntity) {
            request.entity = {
                entityType: boundEntity.entityLogicalName,
                id: boundEntity.id
            };
        }

        // Define request parameters and their values
        if (parameters) {
            parameters.forEach(function (param) {
                defineObjectProperty(request, param.name, param.value);
            });
        }

        return request;
    }

    var executeRequest = function (requestName, requestType, parameters, entityName, id, successCallBack, errorCallBack) {

        var req = generateRequest(requestName, requestType, parameters, entityName, id);

        Xrm.WebApi.online.execute(req)
            .then(successCallBack, errorCallBack);
    };    

    var executeMultipleRequests = function (requestName, requestType, parameters, entityName, ids, successCallBack, errorCallBack){

        var requests = [];

        for (var i = 0; i < ids.length; i++) {
            requests.push(generateRequest(requestName, requestType, parameters, entityName, ids[i]));
        }

        Xrm.WebApi.online.executeMultiple(requests)
            .then(successCallBack, errorCallBack);
    };   

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        CRUD: {
            /// <summary>
            /// Contains methods for common CRUD functionalities (create, read, update, delete).
            /// </summary>
            Create: function (entityName, record, successCallBack, errorCallBack) {
                /// <summary>
                /// Creates a new record into the D365 environment.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/createrecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                /// Logical name of the entity to be created.
                /// </param>
                /// <param name="record" type="object" required="true" >
                /// JSON object containing attributes of the record.
                /// Example: { field: value }                
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                /// Function to call after a successfull execution. See documentation for return values.
                /// </param>
                /// <param name="errorCallBack" type="function" required="true" >
                /// Function to call after a failed execution. See documentation for return values.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.Create: parameter 'entityName' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(record))
                    throw "WebAPI.CRUD.Create: parameter 'record' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.Create: parameter 'successCallBack' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.Create: parameter 'errorCallBack' must be defined!";

                Xrm.WebApi.createRecord(entityName, record)
                    .then(successCallBack, errorCallBack);
            },
            RetrieveByID: function (entityName, id, options, successCallBack, errorCallBack) {
                /// <summary>
                /// Retrieves a single record from the D365 environment by searching with the unique identifier.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/retrieverecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                /// Logical name of the entity to be searched.
                /// </param>
                /// <param name="id" type="object" required="true" >
                /// Unique identifier (GUID) of the record to search.
                /// </param>
                /// <param name="options" type="object" required="false" >
                /// OData system query options, see documentation for details.
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                /// Function to call after a successfull execution. See documentation for return values.
                /// </param>
                /// <param name="errorCallBack" type="function" required="true" >
                /// Function to call after a failed execution. See documentation for return values.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.RetrieveByID: parameter 'entityName' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.CRUD.RetrieveByID: parameter 'id' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.RetrieveByID: parameter 'successCallBack' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.RetrieveByID: parameter 'errorCallBack' must be defined!";

                Xrm.WebApi.retrieveRecord(entityName, fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(id), options)
                    .then(successCallBack, errorCallBack);
            },
            RetrieveByIDSync: async function (entityName, id, options) {
                /// <summary>
                /// Retrieves a single record synchronously from the D365 environment by searching with the unique identifier.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/retrieverecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                /// Logical name of the entity to be searched.
                /// </param>
                /// <param name="id" type="object" required="true" >
                /// Unique identifier (GUID) of the record to search.
                /// </param>
                /// <param name="options" type="object" required="false" >
                /// OData system query options, see documentation for details.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.RetrieveByIDSync: parameter 'entityName' must be defined!";
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.CRUD.RetrieveByIDSync: parameter 'id' must be defined!";

                function getPromise(entityName, id, options) {
                    return new Promise(function (resolve, reject) {
                        Xrm.WebApi.retrieveRecord(entityName, id, options).then(function (record) {
                            resolve(record);
                        }, function (error) {
                            reject(error);
                        });
                    });
                }

                var result = await getPromise(entityName, id, options);
                return result;
            },
            RetrieveMultiple: function (entityName, options, maxPagedSize, successCallBack, errorCallBack) {
                /// <summary>
                /// Retrieves multiple records from the D365 environment by searching witt the odata query.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/retrievemultiplerecords
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity to be searched.
                /// </param>
                /// <param name="options" type="object" required="false" >
                ///  OData system query options, see documentation for details.
                /// </param>
                /// <param name="maxPagedSize" type="integer" required="false" >
                ///  Indicates the number of entity records to be returned per page. If you do not specify this parameter, the default value is passed as 5000.
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. See documentation for return values.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.RetrieveMultiple: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.RetrieveMultiple: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.RetrieveMultiple: parameter 'errorCallBack' must be defined!";

                Xrm.WebApi.retrieveMultipleRecords(entityName, options, maxPagedSize)
                    .then(successCallBack, errorCallBack);
            },
            Update: function (entityName, id, data, successCallBack, errorCallBack) {
                /// <summary>
                /// Updates a single record to the D365 environment.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/updaterecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity to be updated.
                /// </param>
                /// <param name="id" type="object" required="true" >
                ///  Unique identifier of the entity to be updated.
                /// </param>
                /// <param name="data" type="object" required="true" >
                ///  JSON object of the entitys properties and values to be updated.
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. See documentation for return values.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.Update: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.CRUD.Update: parameter 'id' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(data))
                    throw "WebAPI.CRUD.Update: parameter 'data' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.Update: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.Update: parameter 'errorCallBack' must be defined!";

                Xrm.WebApi.updateRecord(entityName, id, data)
                    .then(successCallBack, errorCallBack);
            },
            UpdateMultiple: function (entityName, options, data, successCallBack, errorCallBack) {
                /// <summary>
                /// Updates multiple records to the D365 environment.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/updaterecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity to be updated.
                /// </param>
                /// <param name="options" type="object" required="true" >
                ///  OData system query options, see documentation for details.
                ///  Must contain a select clause.
                /// </param>
                /// <param name="data" type="object" required="true" >
                ///  JSON object of the entitys properties and values to be updated.
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. No return values will be passed.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.UpdateMultiple: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(options))
                    throw "WebAPI.CRUD.UpdateMultiple: parameter 'options' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(data))
                    throw "WebAPI.CRUD.UpdateMultiple: parameter 'data' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.UpdateMultiple: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.UpdateMultiple: parameter 'errorCallBack' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI.CRUD.RetrieveMultiple(entityName, options, null, function (result) {
                    for (var i = 0; i < result.entities.length; i++) {
                        var id = result.entities[i][entityName + "id"];
                        fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI.CRUD.Update(entityName, id, data, function (result) {
                            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("Entity updated successfully: (" + entityName + ", " + id + ")");
                        }, function (err) {
                            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Error("Error occurred when updating entity (" + entityName + ", " + id + "): " + err.message);
                            errorCallBack(err);
                        });
                    }
                    successCallBack();
                }, function (err) {
                    errorCallBack(err);
                });
            },
            Delete: function (entityName, id, successCallBack, errorCallBack) {
                /// <summary>
                /// Deletes a single record from the D365 environment.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/deleterecord
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity to be deleted.
                /// </param>
                /// <param name="id" type="object" required="true" >
                ///  Unique identifier of the entity to be deleted.               
                /// </param>               
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. See documentation for return values.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.CRUD.Delete: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.CRUD.Delete: parameter 'id' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.CRUD.Delete: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.CRUD.Delete: parameter 'errorCallBack' must be defined!";

                Xrm.WebApi.deleteRecord(entityName, id)
                    .then(successCallBack, errorCallBack);
            }
        },
        Requests: {
            /// <summary>
            /// Contains methods for executing actions and workflows.
            /// </summary>    

            ExecuteAction: function (actionName, entityName, id, parameters, successCallBack, errorCallBack) {
                /// <summary>
                /// Executes an action in the D365 environment.
                /// See documentation: https://docs.microsoft.com/fi-fi/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi/online/execute
                /// </summary>
                /// <param name="actionName" type="string" required="true" >
                ///  Logical name of the action to be executed.
                /// </param>
                /// <param name="entityName" type="string" required="false" >
                ///  Logical name of the entity to which the action will be executed.
                /// </param>
                /// <param name="id" type="object" required="false" >
                ///  Unique identifier of the entity to which the action will be executed.               
                /// </param>
                /// <param name="parameters" type="object" required="false" >
                /// Array of parameters that should be passed for the action. Object format:
                /// [
                ///    {
                ///       name: name of the parameter,
                ///       type: type of the parameter,
                ///       value: value of the parameter,
                ///       category: category of the parameter type (use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.EntityDataModel_StructuralType)
                ///    }
                /// ]
                /// </param>                
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. See documentation for return values.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(actionName))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'actionName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'errorCallBack' must be defined!";

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName) && fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'id' must be defined if entityName is defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName) && !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'entityName' must be defined if id is defined!";

                executeRequest(actionName, fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.WebAPI_RequestType.ACTION,
                    parameters, entityName, id, successCallBack, errorCallBack);
            },
            ExecuteMultipleActions: function (actionName, entityName, ids, parameters, successCallBack, errorCallBack) {
                /// <summary>
                /// Executes the same action for multiple records in the D365 environment.
                /// See documentation: https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-webapi/online/executemultiple
                /// </summary>
                /// <param name="actionName" type="string" required="true" >
                ///  Logical name of the action to be executed.
                /// </param>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity to which the action will be executed.
                /// </param>
                /// <param name="ids" type="object" required="true" >
                ///  Array of unique identifiers of the entity to which the action will be executed.               
                /// </param>
                /// <param name="parameters" type="object" required="false" >
                /// Array of parameters that should be passed for the action. Object format:
                /// [
                ///    {
                ///       name: name of the parameter,
                ///       type: type of the parameter,
                ///       value: value of the parameter,
                ///       category: category of the parameter type (use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.EntityDataModel_StructuralType)
                ///    }
                /// ]
                /// </param>                
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to call after a successfull execution. See documentation for return values.
                /// </param>   
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to call after a failed execution. See documentation for return values.
                /// </param>   

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(actionName))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'actionName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'errorCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(ids))
                    throw "WebAPI.Requests.ExecuteAction: parameter 'ids' must be defined!";

                executeMultipleRequests(actionName, fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.WebAPI_RequestType.ACTION,
                    parameters, entityName, ids, successCallBack, errorCallBack);                
            }
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// UI functionalities (forms, grids, navigation etc.)
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        Listeners: {
            Field: {
                RegisterOnChangeEvent: function (fieldName, functionToAdd) {
                    /// <summary>
                    /// Register a new OnChange listener to a specific field.
                    /// </summary> 
                    /// <param name="fieldName" type="string" required="true" >
                    ///  Logical name of the field to which register the OnChange event.
                    /// </param>     
                    /// <param name="functionToAdd" type="function" required="true" >
                    ///  Function to execute after the event occurs.
                    /// </param>       

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                        throw "UI.Listeners.Field.RegisterOnChangeEvent: parameter 'fieldName' must be defined!";

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToAdd))
                        throw "UI.Listeners.Field.RegisterOnChangeEvent: parameter 'functionToAdd' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).addOnChange(functionToAdd);
                },
                UnRegisterOnChangeEvent: function (fieldName, functionToRemove) {
                    /// <summary>
                    /// Removes a OnChange listener from a specific field.
                    /// </summary> 
                    /// <param name="fieldName" type="string" required="true" >
                    ///  Logical name of the field from which unregister the OnChange event.
                    /// </param>                         

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                        throw "UI.Listeners.Field.RegisterOnChangeEvent: parameter 'fieldName' must be defined!";

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToRemove))
                        throw "UI.Listeners.Field.RegisterOnChangeEvent: parameter 'functionToRemove' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).removeOnChange(functionToRemove);
                },
            },
            Form: {
                RegisterOnPreSaveEvent: function (functionToAdd) {
                    /// <summary>
                    /// Register a new OnSave listener to the form which executes the callback function before the form is saved.
                    /// </summary>                   
                    /// <param name="functionToAdd" type="function" required="true" >
                    ///  Function to execute before the event occurs.
                    /// </param>       

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToAdd))
                        throw "UI.Listeners.Form.RegisterOnPreSaveEvent: parameter 'functionToAdd' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.entity.addOnSave(functionToAdd);
                },
                UnRegisterOnPreSaveEvent: function (functionToRemove) {
                    /// <summary>
                    /// Unregisters a OnSave listener from the form.
                    /// </summary>                   
                    /// <param name="functionToRemove" type="function" required="true" >
                    ///  Function to remove.
                    /// </param>       

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToRemove))
                        throw "UI.Listeners.Form.UnRegisterOnPreSaveEvent: parameter 'functionToRemove' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.entity.removeOnSave(functionToRemove);
                },
                RegisterOnPostSaveEvent: function (functionToAdd) {
                    /// <summary>
                    /// Register a new OnPostSave listener to the form which executes the callback function after the form is saved.
                    /// </summary>                   
                    /// <param name="functionToAdd" type="function" required="true" >
                    ///  Function to execute after the event occurs.
                    /// </param>    

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToAdd))
                        throw "UI.Listeners.Form.RegisterOnPostSaveEvent: parameter 'functionToAdd' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.entity.addOnPostSave(functionToAdd);
                },
                UnRegisterOnPostSaveEvent: function (functionToRemove) {
                    /// <summary>
                    /// Unregisters a OnPostSave listener from the form.
                    /// </summary>                   
                    /// <param name="functionToRemove" type="function" required="true" >
                    ///  Function to remove.
                    /// </param>       

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToRemove))
                        throw "UI.Listeners.Form.UnRegisterOnPostSaveEvent: parameter 'functionToRemove' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.entity.removeOnPostSave(functionToRemove);
                }
            },
            Tab: {
                RegisterTabStateChangeEvent: function (tabName, fuctionToAdd) {
                    /// <summary>
                    /// Register a new TabStateChange listener to the form which executes the callback function when the event occurs.
                    /// </summary>                   
                    /// <param name="functionToAdd" type="function" required="true" >
                    ///  Function to execute.
                    /// </param>     

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                        throw "UI.Listeners.Tab.RegisterTabStateChangeEvent: parameter 'tabName' must be defined!";

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fuctionToAdd))
                        throw "UI.Listeners.Tab.RegisterTabStateChangeEvent: parameter 'fuctionToAdd' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true).addTabStateChange(fuctionToAdd);
                },
                UnRegisterTabStateChangeEvent: function (tabName, functionToRemove) {
                    /// <summary>
                    /// UNregister a TabStateChange listener from the form.
                    /// </summary>                   
                    /// <param name="functionToRemove" type="function" required="true" >
                    ///  Function to remove.
                    /// </param>     

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                        throw "UI.Listeners.Tab.UNRegisterTabStateChangeEvent: parameter 'tabName' must be defined!";

                    if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(functionToRemove))
                        throw "UI.Listeners.Tab.UNRegisterTabStateChangeEvent: parameter 'functionToRemove' must be defined!";

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true).removeTabStateChange(functionToRemove);
                }
            },
            Grid: {
                // TODO add listener registrations
            },
            BPF: {
                // TODO add listener registrations
            }
        },
        Control: {
            GetControl: function (controlName, throwErrorIfNotFound) {
                /// <summary>
                /// Returns the given control context on the form.
                /// </summary>
                /// <param name="controlName" type="string" required="true" >
                ///  Name of the control.
                /// </param>
                /// <param name="throwErrorIfNotFound" type="boolean" required="false" >
                ///  Indicates if an error should be thrown when the control is not found.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(controlName))
                    throw "UI.Control.GetControl: parameter 'controlName' must be defined!";

                var control = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().getControl(controlName);

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(control) && throwErrorIfNotFound)
                    throw "UI.Control.GetControl: control does not exist on form, unable to get control context! (" + controlName + ")";

                return control;
            }
        },
        Form: {
            GetType: function () {
                /// <summary>
                /// Returns the type of the form.
                /// See documentation for details: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/formcontext-ui/getformtype
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.getFormType();
            },
            GetForm: function (formName) {
                /// <summary>
                /// Returns form by given name.
                /// </summary>
                /// <param name="formName" type="string" required="true" >
                ///  If the form should be saved before it is closed.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(formName))
                    throw "UI.Form.GetForm: parameter 'formName' must be defined!";

                var availableForms = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Form.GetCurrentEntityAllForms();
                var form;

                for (var i = 0; i < availableForms.length; i++) {
                    var availableForm = availableForms[i];
                    if (availableForm.getLabel().toLowerCase() == formName.toLowerCase())
                        form = availableForm;
                }

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(form))
                    throw "UI.Form.GetForm: form does not exist, unable to return form! (" + formName + ")";

                return form;
            },
            GetCurrentForm: function () {
                /// <summary>
                /// Returns currently opened entity form
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.formSelector.getCurrentItem();
            },
            GetCurrentEntityAllForms: function () {
                /// <summary>
                /// Returns a list of forms for the currently opened entity.
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.formSelector.items.get();
            },
            Close: function (saveBeforeClosing) {
                /// <summary>
                /// Closes the form.                
                /// </summary>
                /// <param name="saveBeforeClosing" type="boolean" required="false" >
                ///  If the form should be saved before it is closed.
                /// </param>

                if (saveBeforeClosing) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.Save(null, function () {
                        fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.close();
                    }, function (err) {
                        throw "UI.Form.Close: " + err.message;
                    });
                }
                else {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.close();
                }
            },
            IsDirty: function () {
                /// <summary>
                /// Checks if the field values have been modified on the form but not saved yet.
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.getIsDirty();
            },
            NavigateToForm: function (formName) {
                /// <summary>
                /// Navigates to given form with current context.
                /// </summary>
                /// <param name="formName" type="string" required="true" >
                ///  Name of the form to open.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(formName))
                    throw "UI.Form.NavigateToForm: parameter 'formName' must be defined!";

                var currentForm = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Form.GetCurrentForm();
                var availableForms = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Form.GetCurrentEntityAllForms();
                var form;

                for (var i = 0; i < availableForms.length; i++) {
                    var availableForm = availableForms[i];
                    if (availableForm.getLabel().toLowerCase() == formName.toLowerCase())
                        form = availableForm;
                }

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(form))
                    throw "UI.Form.NavigateToForm: form does not exist, unable to navigate to form! (" + formName + ")";

                if (form.getId() == currentForm.getId()) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Warning("Form " + formName + " already open.");
                }
                else {
                    form.navigate();
                }
            },
            Refresh: function (saveBeforeRefresh, successCallBack, errorCallBack) {
                /// <summary>
                /// Refreshes the given form with an option to save changes.
                /// </summary>
                /// <param name="saveBeforeRefresh" type="boolean" required="true" >
                ///  Indicates if the changes should be saved first.
                /// </param>
                /// <param name="successCallBack" type="function" required="false" >
                ///  Function to execute after the refresh.
                /// </param>
                /// <param name="errorCallBack" type="function" required="false" >
                ///  Function to execute when the refresh fails.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(saveBeforeRefresh))
                    throw "UI.Form.Refresh: parameter 'saveBeforeRefresh' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack) || fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack)) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.refresh(saveBeforeRefresh);
                }
                else {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.refresh(saveBeforeRefresh).then(successCallBack, errorCallBack);
                }                
            },
            GetState: function () {
                /// <summary>
                /// Returns forms current state.
                /// See documentation for details: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/formcontext-ui/getformtype
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.getFormType();
            },
            OpenFormExistingRecord: function (entityName, id, formId) {
                /// <summary>
                /// Opens form for existing record.
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity.
                /// </param>
                /// <param name="id" type="string" required="true" >
                ///  GUID of the entity.
                /// </param>
                /// <param name="formId" type="string" required="false" >
                ///  GUID of the entity form to use.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "UI.Form.OpenFormExistingRecord: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "UI.Form.OpenFormExistingRecord: parameter 'id' must be defined!";

                var options = null;

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(formId)) {
                    options = { entityName: entityName, entityId: id };
                }
                else {
                    options = { entityName: entityName, entityId: id, formId:  formId};
                }
                
                Xrm.Navigation.openForm(options);
            },
            OpenFormNewRecord: function (entityName, useQuickCreateForm, useNewWindow, formParams, formId) {
                /// <summary>
                /// Opens form for a new record.
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity.
                /// </param>
                /// <param name="useQuickCreateForm" type="bool" required="false" >
                ///  If the new record should be opened in a quick create form. If not given then false will be used as a default value.
                ///  If true, both entity and the quick create form must be included in the app + Allow quick create must be true.
                /// </param>
                /// <param name="useNewWindow" type="bool" required="false" >
                ///  If the record should be opened in a new window.
                /// </param>
                /// <param name="formParams" type="object" required="false" >
                ///  A dictionary object that passes extra parameters to the form. Invalid parameters will cause an error.
                /// </param>
                /// <param name="formId" type="string" required="false" >
                ///  GUID of the entity form to use.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "UI.Form.OpenFormExistingRecord: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(useQuickCreateForm))
                    useQuickCreateForm = false;

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(useNewWindow))
                    useNewWindow = false;

                var options = null;

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(formId)) {
                    options = { entityName: entityName, useQuickCreateForm: useQuickCreateForm, openInNewWindow: useNewWindow };
                }
                else {
                    options = { entityName: entityName, useQuickCreateForm: useQuickCreateForm, openInNewWindow: useNewWindow, formId: formId };
                }
               
                Xrm.Navigation.openForm(options, formParams);
            },
            SetFormFieldsState: function (areEnabled, exceptFields) {
                /// <summary>
                /// Enables or disables all the fields in a form.
                /// </summary>
                /// <param name="areEnabled" type="boolean" required="true" >
                ///  Indicates if the form field should be enabled.
                /// </param>
                /// <param name="exceptFields" type="string" required="false" >
                ///  List of field names separated with a comma that should not be processed by the function.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(areEnabled))
                    throw "UI.Form.SetFormFieldsState: parameter 'areEnabled' must be defined!";

                var attributes = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecordAttributes();               

                attributes.forEach(function (attribute) {

                    attribute.controls.forEach(function (control) {

                        if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(control))
                            return;

                        if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(exceptFields)) {
                            control.setDisabled(!areEnabled);
                        }
                        else if (!exceptFields.includes(attribute.getName())) {
                            control.setDisabled(!areEnabled);
                        }                        
                        
                    });

                });

            }
        },
        Field: {
            GetField: function (fieldName, throwErrorIfNotFound) {
                /// <summary>
                /// Returns the given field context on the form.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field to return.
                /// </param>
                /// <param name="throwErrorIfNotFound" type="boolean" required="false" >
                ///  Indicates if an error should be thrown when the field is not found.
                /// </param>                

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.GetField: parameter 'fieldName' must be defined!";

                var field = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().getAttribute(fieldName);

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(field) && throwErrorIfNotFound)
                    throw "UI.Field.GetField: field does not exist on form, unable to get field context! (" + fieldName + ")";

                return field;
            },
            GetType: function (fieldName) {
                /// <summary>
                /// Returns enum fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.Field_AttributeType indicating the given fields attribute type on the form.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which attribute type should be returned.
                /// </param>              
                
                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.GetFieldType: parameter 'fieldName' must be defined!";

                var field = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true);

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(field))
                    return null;

                var type = field.getAttributeType();

                var i = Object.keys(fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.Field_AttributeType).indexOf(type);

                if (i == -1)
                    throw "No enum found based on the value '" + type + "' from fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.Field_AttributeType!";              

                return Object.keys(fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.Field_AttributeType)[i];
            },
            GetValue: function (fieldName) {
                /// <summary>
                /// Returns the given fields value.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which value should be returned.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.GetValue: parameter 'fieldName' must be defined!";

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).getValue();
            },
            SetValue: function (fieldName, value) {
                /// <summary>
                /// Sets the given value to the field.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which value should be set.
                /// </param>
                /// <param name="value" type="object" required="true" >
                ///  Value to set.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.SetValue: parameter 'fieldName' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).setValue(value);
            },
            SetLookupValue: function (fieldName, entityLogicalName, entityId, name) {
                /// <summary>
                /// Sets the given value to the lookup field.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the lookup field.
                /// </param>
                /// <param name="entityLogicalName" type="string" required="true" >
                ///  Logical name of the lookup entity.
                /// </param>
                /// <param name="entityId" type="string" required="true" >
                ///  GUID of the entity record.
                /// </param>
                /// <param name="name" type="string" required="true" >
                ///  Name of the entity record.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.SetLookupValue: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityLogicalName))
                    throw "UI.Field.SetLookupValue: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityId))
                    throw "UI.Field.SetLookupValue: parameter 'entityId' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(name))
                    throw "UI.Field.SetLookupValue: parameter 'name' must be defined!";

                var lookupValue = [
                    {
                        id: entityId,
                        name: name,
                        entityType: entityLogicalName,
                    }];

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.SetValue(fieldName, lookupValue);
            },
            SetRequirementLevel: function (fieldName, level) {
                /// <summary>
                /// Sets the requirement level of the field.
                /// See documentation for details: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/attributes/setrequiredlevel
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which requirement level should be set.
                /// </param>
                /// <param name="level" type="string" required="true" >
                ///  Requirement level to set. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.FieldRequirement_Level
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.SetRequirementLevel: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(level))
                    throw "UI.Field.SetRequirementLevel: parameter 'level' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).setRequiredLevel(level);
            },
            SetSubmitMode: function (fieldName, mode) {
                /// <summary>
                /// Sets the submit mode of the field.
                /// See documentation for details: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/attributes/setsubmitmode
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which submit mode should be set.
                /// </param>
                /// <param name="mode" type="string" required="true" >
                ///  Requirement level to set. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.Field_SubmitModes
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.SetSubmitMode: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(mode))
                    throw "UI.Field.SetSubmitMode: parameter 'mode' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).setSubmitMode(mode);
            },
            SetFieldState: function (fieldName, isEnabled) {
                /// <summary>
                /// Enables or disables the field in form.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field that should be enabled.
                /// </param>
                /// <param name="isEnabled" type="boolean" required="true" >
                ///  Indicates if the field should be enabled.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.SetFieldState: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(isEnabled))
                    throw "UI.Field.SetFieldState: parameter 'isEnabled' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).setDisabled(!isEnabled);
            },
            TriggerOnChange: function (fieldName) {
                /// <summary>
                /// Triggers the given fields OnChange event on the form.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which OnChhange event should be triggered.
                /// </param>           

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.TriggerFieldOnChange: parameter 'fieldName' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).fireOnChange();
            },
            IsDirty: function (fieldName) {
                /// <summary>
                /// Returns true if the field contains any unsaved changes.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field which should be checked.
                /// </param>    

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Field.GetValue: parameter 'fieldName' must be defined!";

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Field.GetField(fieldName, true).getIsDirty();
            }
        },
        Tab: {
            GetTab: function (tabName, throwErrorIfNotFound) {
                /// <summary>
                /// Returns the given tab context on the form.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab to return.
                /// </param>
                /// <param name="throwErrorIfNotFound" type="boolean" required="false" >
                ///  Indicates if an error should be thrown when the tab is not found.
                /// </param>      

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Tab.GetTab: parameter 'tabName' must be defined!";

                var tab = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.tabs.get(tabName);

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tab) && throwErrorIfNotFound)
                    throw "UI.Tab.GetTab: tab does not exist on form, unable to get tab context! (" + tabName + ")";

                return tab;
            },
            SetVisibility: function (tabName, isVisible) {
                /// <summary>
                /// Sets tabs visibility.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab.
                /// </param>                
                /// <param name="isVisible" type="boolean" required="true" >
                ///  Indicates if the tab should be visible.
                /// </param>      

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Tab.SetVisibility: parameter 'tabName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(isVisible))
                    throw "UI.Tab.SetVisibility: parameter 'isVisible' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true).setVisible(isVisible);
            },
            SetTabFieldsState: function (tabName, areEnabled, exceptFields) {
                /// <summary>
                /// Enables or disables all the fields in a tab.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab.
                /// </param>
                /// <param name="areEnabled" type="boolean" required="true" >
                ///  Indicates if the tabs field should be enabled.
                /// </param>
                /// <param name="exceptFields" type="string" required="false" >
                ///  List of field names separated with a comma that should not be processed by the function.
                /// </param>      

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Tab.SetTabFieldsState: parameter 'tabName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(areEnabled))
                    throw "UI.Tab.SetTabFieldsState: parameter 'areEnabled' must be defined!";

                var sections = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true).sections.get();

                for (var i = 0; i < sections.length; i++) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Section.SetSectionFieldsState(tabName, sections[i].getName(), areEnabled, exceptFields);
                }
            },
            IsVisible: function (tabName) {
                /// <summary>
                /// Returns true if the given tab is visible on the form.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab to check.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Tab.IsVisible: parameter 'tabName' must be defined!";

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true).getVisible();
            }
        },
        Grid: {
            ShowSidePaneForSelectedRecord: async function (title, width) {
                /// <summary>
                /// Opens a Outlook styled side panel for the currently selected record.
                /// See documentation https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/xrm-app/xrm-app-sidepanes/createpane
                /// </summary>
                /// <param name="title" type="string" required="false" >
                ///  Title for the side pane.
                /// </param>
                /// <param name="width" type="integer" required="false" >
                ///  Width of the side pane. If not given then a 1/3 of the screen will be used.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(width))
                    width = screen.length / 3;

                var sidePanes = parent.Xrm.App.sidePanes;

                sidePanes.state = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.SidePane_State.COLLAPSED;

                if (sidePanes.getPane("selectedRecordPane") != undefined)
                    sidePanes.getPane("selectedRecordPane").close();

                var selectedRecordPane = {
                    title: title,
                    canClose: true,
                    alwaysRended: false,
                    paneId: "selectedRecordPane",
                    width: width
                };

                var recordPanel = await sidePanes.createPane(selectedRecordPane);

                let selectedRecordPageInput = {
                    pageType: "entityrecord",
                    entityName: fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetEntityName(),
                    entityId: fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetId(true)
                };

                await recordPanel.navigate(selectedRecordPageInput);
            },
            Refresh: function (gridName) {
                /// <summary>
                /// Refreshes the data on the given grid on the form.
                /// </summary>
                /// <param name="gridName" type="string" required="true" >
                ///  Name of the grid to refresh.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(gridName))
                    throw "UI.Grid.Refresh: parameter 'gridName' must be defined!";

                var grid = JsLib.UI.Control.GetControl(gridName, true);
                grid.refresh();
            },
        },
        Notification: {
            ShowFormNotification: function (message, type, durationInSeconds) {
                /// <summary>
                /// Shows a form notification for the user with given time period.
                /// </summary>
                /// <param name="message" type="string" required="true" >
                ///  Notification message to show.
                /// </param>
                /// <param name="type" type="enum" required="true" >
                ///  Type of the notification message. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.FormNotification_Type
                /// </param>
                /// <param name="durationInSeconds" type="integer" required="false" >
                ///  How long the notification should be shown in the form. If not given then the notification will be shown until it is removed.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                    throw "UI.Notification.ShowFormNotification: parameter 'message' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(type))
                    throw "UI.Notification.ShowFormNotification: parameter 'type' must be defined!";

                var id = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.GenerateGUID();
                var success = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.setFormNotification(message, type, id);

                if (success && durationInSeconds) {
                    setTimeout(function () {
                        fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Notification.ClearFormNotification(id);
                    }, durationInSeconds * 1000);
                }

                if (!success)
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Error("Error occurred when setting a form notification.");

                return success ? id : null;
            },
            ClearFormNotification: function (id) {
                /// <summary>
                /// Clears a given form notification.
                /// </summary>
                /// <param name="id" type="string" required="true" >
                ///  GUID of the notification to clear.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                    throw "UI.Notification.ClearNotification: parameter 'id' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.clearFormNotification(id);
            },
            ShowInAppNotification: function (title, message, durationInSeconds, userId, iconType, actionTitle, actionUrl, actionNavigation) {
                /// <summary>
                /// Shows a in-app notification (toast) for the desired user.
                /// See documentation for details: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/send-in-app-notifications
                /// </summary>
                /// <param name="title" type="string" required="true" >
                ///  Title of the in-app notification.
                /// </param>
                /// <param name="message" type="string" required="true" >
                ///  Notification message to show.
                /// </param>
                /// <param name="durationInSeconds" type="integer" required="false" >
                ///  Duration for the notification to be shown. IF not given then default value 4 seconds will be used.
                /// </param>
                /// <param name="userId" type="string" required="true" >
                ///  GUID of the user who should receive the message.
                /// </param>
                /// <param name="iconType" type="integer" required="false" >
                ///  Type of the icon. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.InAppNotification_IconType. If not given then default INFO will be used.
                /// </param>
                /// <param name="actionTitle" type="string" required="false" >
                ///  Title for the action URL.
                /// </param>
                /// <param name="actionUrl" type="string" required="false" >
                ///  URL for the action.
                /// </param>
                /// <param name="actionNavigation" type="string" required="false" >
                /// Indicates where the notification action should be shown. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.InAppNotification_NavigationTarget. If not given then default value Dialog will be used.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(title))
                    throw "UI.Notification.ShowInAppNotification: parameter 'title' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                    throw "UI.Notification.ShowInAppNotification: parameter 'message' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(durationInSeconds))
                    throw "UI.Notification.ShowInAppNotification: parameter 'durationInSeconds' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(userId))
                    throw "UI.Notification.ShowInAppNotification: parameter 'userId' must be defined!";

                var record = null;
                var hasAction = !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(actionTitle) && !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(actionUrl) ? true : false;
                if (hasAction && fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(actionNavigation))
                    actionNavigation = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.InAppNotification_NavigationTarget.DIALOG;

                if (hasAction) {
                    record =
                    {
                        "title": title,
                        "body": message,
                        "ownerid@odata.bind": "/systemusers(" + fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(userId) + ")",
                        "icontype": fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(iconType) ? fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.InAppNotification_IconType.INFO : iconType,
                        "toasttype": 200000000, // timed
                        "data": JSON.stringify({
                            "actions": [
                                {
                                    "title": actionTitle,
                                    "data": { "url": actionUrl, "navigationTarget": actionNavigation }
                                }
                            ]
                        })
                    };
                }
                else {
                    record =
                    {
                        "title": title,
                        "body": message,
                        "ownerid@odata.bind": "/systemusers(" + fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(userId) + ")",
                        "icontype": fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(iconType) ? fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.InAppNotification_IconType.INFO : iconType,
                        "toasttype": 200000000, // timed                        
                    };
                }

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI.CRUD.Create("appnotification", record, function (result) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("In-app notification created successfully: " + result.id);
                }, function (error) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Error("Error occurred when creating in-app notification: " + error.message);
                });
            },
            ShowGlobalNotification: function (subject, message, notificationLevel, canBeClosed, clickAction, successCallBack, errorCallBack) {
                /// <summary>
                /// Shows a global notification to the users.
                /// See documentation for details: https://docs.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-app/addglobalnotification
                /// </summary>
                /// <param name="subject" type="string" required="false" >
                ///  Subject of the notification is shown if a clickAction is defined.
                /// </param>
                /// <param name="message" type="string" required="true" >
                ///  Actual message that is shown to the users.
                /// </param>
                /// <param name="notificationLevel" type="integer" required="false" >
                ///  Type of the notification. Use fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.GlobalNotification_Type. If not given then default INFORMATION will be used.
                /// </param>
                /// <param name="canBeClosed" type="boolean" required="false" >
                ///  Indicates if the user can dismiss the notification. If not given then default true will be used.
                /// </param>
                /// <param name="clickAction" type="function" required="false" >
                ///  Function to trigger by clicking the notification.
                /// </param>
                /// <param name="successCallBack" type="function" required="true" >
                ///  Function to execute after the notification has been sent.
                /// </param>
                /// <param name="errorCallBack" type="function" required="true" >
                ///  Function to execute when the notification fails.
                /// </param>                

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                    throw "UI.Notification.ShowGlobalNotification: parameter 'message' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                    throw "UI.Notification.ShowGlobalNotification: parameter 'successCallBack' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                    throw "UI.Notification.ShowGlobalNotification: parameter 'errorCallBack' must be defined!";

                var globalNotification =
                {
                    type: 2, // Currently only type 2 is supported
                    level: notificationLevel,
                    message: message,
                    action: !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(clickAction) ? { actionLabel: subject, eventHandler: clickAction } : null,
                    showCloseButton: !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(canBeClosed) ? canBeClosed : true,
                };

                Xrm.App.addGlobalNotification(globalNotification).then(
                    function success(id) {
                        successCallBack(id);
                    },
                    function (err) {
                        errorCallBack(err);
                    }
                );
            }
        },
        Section: {
            GetSection: function (tabName, sectionName, throwErrorIfNotFound) {
                /// <summary>
                /// Returns the given section context on the form.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab where the section is located.
                /// </param>
                /// <param name="sectionName" type="string" required="true" >
                ///  Name of the section to return.
                /// </param>
                /// <param name="throwErrorIfNotFound" type="boolean" required="false" >
                ///  Indicates if an error should be thrown when the sectionName is not found.
                /// </param>      

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Section.GetSection: parameter 'tabName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(sectionName))
                    throw "UI.Section.GetSection: parameter 'sectionName' must be defined!";

                var tab = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Tab.GetTab(tabName, true);
                var section = tab.sections.get(sectionName);

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(section) && throwErrorIfNotFound)
                    throw "UI.Section.GetSection: section does not exist on form, unable to get section context! (" + sectionName + ")";

                return section;
            },
            SetVisibility: function (tabName, sectionName, isVisible) {
                /// <summary>
                /// Sets sections visibility.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab where the section is located.
                /// </param>
                /// <param name="sectionName" type="string" required="true" >
                ///  Name of the section to return.
                /// </param>
                /// <param name="isVisible" type="boolean" required="true" >
                ///  Indicates if the section should be visible.
                /// </param>      

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Section.SetVisibility: parameter 'tabName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(sectionName))
                    throw "UI.Section.SetVisibility: parameter 'sectionName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(isVisible))
                    throw "UI.Section.SetVisibility: parameter 'isVisible' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Section.GetSection(tabName, sectionName, true).setVisible(isVisible);
            },
            SetSectionFieldsState: function (tabName, sectionName, areEnabled, exceptFields) {
                /// <summary>
                /// Enables or disables all the fields in a section.
                /// </summary>
                /// <param name="tabName" type="string" required="true" >
                ///  Name of the tab where the section is located.
                /// </param>
                /// <param name="sectionName" type="string" required="true" >
                ///  Name of the section..
                /// </param>
                /// <param name="areEnabled" type="boolean" required="true" >
                ///  Indicates if the sections field should be enabled.
                /// </param>
                /// <param name="exceptFields" type="string" required="false" >
                ///  List of field names separated with a comma that should not be processed by the function.
                /// </param>    

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(tabName))
                    throw "UI.Section.SetSectionFieldsState: parameter 'tabName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(sectionName))
                    throw "UI.Section.SetSectionFieldsState: parameter 'sectionName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(areEnabled))
                    throw "UI.Section.SetSectionFieldsState: parameter 'areEnabled' must be defined!";

                var controls = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Section.GetSection(tabName, sectionName, true).controls.get();                

                for (var i = 0; i < controls.length; i++) {
                    var typeOfControl = controls[i].getControlType();
                    if (typeOfControl != "iframe" && typeOfControl != "webresource" && typeOfControl != "subgrid") {
                        if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(exceptFields)) {
                            controls[i].setDisabled(!areEnabled);
                        }
                        else if (!exceptFields.includes(controls[i]._controlName)) {
                            controls[i].setDisabled(!areEnabled);
                        }
                    }
                }
            }
        },
        Optionset: {
            AddOption: function (fieldName, option, label, index) {
                /// <summary>
                /// Adds a new value to the optionset during runtime. Value is not stored into database.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>
                /// <param name="option" type="integer" required="true" >
                ///  Value of the optionset.
                /// </param>
                /// <param name="label" type="string" required="true" >
                ///  Label for the optionset value.
                /// </param>
                /// <param name="index" type="integer" required="true" >
                ///  Index where the value should be shown.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Optionset.AddOption: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(option))
                    throw "UI.Optionset.AddOption: parameter 'option' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(label))
                    throw "UI.Optionset.AddOption: parameter 'label' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(index))
                    throw "UI.Optionset.AddOption: parameter 'index' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Optionset.HasOption(fieldName, option))
                    return;                

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).addOption({ value: option, text: label }, index);

            },
            RemoveOption: function (fieldName, option) {
                /// <summary>
                /// Removes a value from the optionset during runtime. Removing does not remove the value from the db.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>
                /// <param name="option" type="integer" required="true" >
                ///  Value of the optionset.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Optionset.RemoveOption: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(option))
                    throw "UI.Optionset.RemoveOption: parameter 'option' must be defined!";

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Optionset.HasOption(fieldName, option))
                    return;

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).removeOption(option);
            },
            RemoveOptions: function (fieldName) {
                /// <summary>
                /// Removes all values from the optionset during runtime. Removing does not remove the values from the db.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Optionset.RemoveOptions: parameter 'fieldName' must be defined!";
                
                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).clearOptions();
            },
            HasOption: function (fieldName, option) {
                /// <summary>
                /// Checks if the given value already exists in the optionset.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>
                /// <param name="option" type="integer" required="true" >
                ///  Value to check
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Optionset.HasOption: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(option))
                    throw "UI.Optionset.HasOption: parameter 'option' must be defined!";

                var options = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Optionset.GetOptions(fieldName);

                for (var i = 0; i < options.length; i++) {
                    if (options[i].value === option)
                        return true;
                }

                return false;

            },
            GetOptions: function (fieldName) {
                /// <summary>
                /// Returns all the values in the optionset.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Optionset.GetOptions: parameter 'fieldName' must be defined!";

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).getOptions();
            }
        },
        Lookup: {
            Prefilter: function (fieldName, entityName, fetchXML) {
                /// <summary>
                /// Prefilters lookups values with fetchXML.
                /// </summary>
                /// <param name="fieldName" type="string" required="true" >
                ///  Name of the field.
                /// </param>
                /// <param name="entityName" type="string" required="true" >
                ///  Name of the entity.
                /// </param>
                /// <param name="fetchXML" type="string" required="true" >
                ///  FetchXML used to filter the values.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                    throw "UI.Lookup.Prefilter: parameter 'fieldName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "UI.Lookup.Prefilter: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fetchXML))
                    throw "UI.Lookup.Prefilter: parameter 'fetchXML' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).addPreSearch(function () {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Control.GetControl(fieldName, true).addCustomFilter(fetchXML, entityName);
                });
            }
        },
        Dialogue: {
            ShowAlert: function (header, btnText, alertText, pxlHeight = null, pxlWidth = null, successCallBack, errorCallBack) {
                /// <summary>
                /// Shows an alert for the user.
                /// </summary>
                /// <param name="header" type="string" required="true" >
                ///  Header for the alert.
                /// </param>
                /// <param name="btnText" type="string" required="true" >
                ///  Text for the alert button.
                /// </param>
                /// <param name="alertText" type="string" required="true" >
                ///  Text for the alert itself.
                /// </param>
                /// <param name="pxlHeight" type="integer" required="false" >
                ///  Height of the dialogue in pixels.
                /// </param>
                /// <param name="pxlWidth" type="integer" required="false" >
                ///  Width of the dialogue in pixels.
                /// </param>
                /// <param name="successCallBack" type="function" required="false" >
                ///  Function to execute after user clicks the button.
                /// </param>
                /// <param name="errorCallBack" type="function" required="false" >
                ///  Function to execute after when the alert fails.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(header))
                    throw "UI.Dialogue.ShowAlert: parameter 'header' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(btnText))
                    throw "UI.Dialogue.ShowAlert: parameter 'btnText' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(alertText))
                    throw "UI.Dialogue.ShowAlert: parameter 'alertText' must be defined!";                

                var options = { confirmButtonLabel: btnText, text: alertText, title: header };
                var sizeOptions = null;

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(pxlHeight) && !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(pxlWidth)) {
                    sizeOptions = { height: pxlHeight, width: pxlWidth };
                }

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack)) {
                    Xrm.Navigation.openAlertDialog(options, sizeOptions);
                }
                else {
                    Xrm.Navigation.openAlertDialog(options, sizeOptions)
                        .then(successCallBack, errorCallBack);
                }
            },
            ShowConfirmation: function (header, btnOKText, btnCancelText, confirmationText, successCallBack, errorCallBack) {
                /// <summary>
                /// Shows a confirmation message for the user.
                /// </summary>
                /// <param name="header" type="string" required="true" >
                ///  Header for the alert.
                /// </param>
                /// <param name="btnOKText" type="string" required="true" >
                ///  Text for the OK button.
                /// </param>
                /// <param name="btnCancelText" type="string" required="true" >
                ///  Text for the Cancel button.
                /// </param>
                /// <param name="confirmationText" type="string" required="true" >
                ///  Text for the confirmation  itself.
                /// </param>
                /// <param name="successCallBack" type="function" required="false" >
                ///  Function to execute after user clicks the button.
                /// </param>
                /// <param name="errorCallBack" type="function" required="false" >
                ///  Function to execute after when the alert fails.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(header))
                    throw "UI.Dialogue.ShowConfirmation: parameter 'header' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(btnOKText))
                    throw "UI.Dialogue.ShowConfirmation: parameter 'btnOKText' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(btnCancelText))
                    throw "UI.Dialogue.ShowConfirmation: parameter 'btnCancelText' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(confirmationText))
                    throw "UI.Dialogue.ShowConfirmation: parameter 'confirmationText' must be defined!";

                var options = { confirmButtonLabel: btnOKText, cancelButtonLabel: btnCancelText, text: confirmationText, title: header };

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack)) {
                    Xrm.Navigation.openConfirmDialog(options, null);
                }
                else {
                    Xrm.Navigation.openConfirmDialog(options, null)
                        .then(successCallBack, errorCallBack);
                }
            },
            ShowError: function (errMessage, errDetails, errCode = null, successCallBack, errCallBack) {
                /// <summary>
                /// Shows an error message for the user.
                /// </summary>
                /// <param name="errMessage" type="string" required="true" >
                ///  Header for the error dialogue.
                /// </param>
                /// <param name="errDetails" type="string" required="true" >
                ///  Details for the error itself.
                /// </param>
                /// <param name="errCode" type="integer" required="false" >
                ///  The error code. If not provided then the error code is automatically retrieved from the server and showed in the dialogue.
                /// If you specify an invalid errorCode value, an error dialog with a default error message is displayed.
                /// </param>
                /// <param name="successCallBack" type="function" required="false" >
                ///  Function to execute after user clicks the button.
                /// </param>
                /// <param name="errorCallBack" type="function" required="false" >
                ///  Function to execute after when the alert fails.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errMessage))
                    throw "UI.Dialogue.ShowError: parameter 'errMessage' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errDetails))
                    throw "UI.Dialogue.ShowError: parameter 'errDetails' must be defined!";              

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack)) {
                    if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errCode)) {
                        Xrm.Navigation.openErrorDialog({ message: errMessage, details: errDetails, errorCode: errCode });                            
                    }
                    else {
                        Xrm.Navigation.openErrorDialog({ message: errMessage, details: errDetails });                            
                    }
                }
                else {
                    if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errCode)) {
                        Xrm.Navigation.openErrorDialog({ message: errMessage, details: errDetails, errorCode: errCode })
                            .then(successCallBack, errorCallBack);
                    }
                    else {
                        Xrm.Navigation.openErrorDialog({ message: errMessage, details: errDetails })
                            .then(successCallBack, errorCallBack);
                    }
                }
            }
        },
        BPF: {
            GetProcessContext: function () {
                /// <summary>
                /// Returns BPF context.
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.process;
            },
            GetActiveProcess: function () {
                /// <summary>
                /// Returns currently active BPF process on the form.
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.process.getActiveProcess();
            },
            GetActiveProcessName: function () {
                /// <summary>
                /// Returns the name of currently active BPF process on the form.
                /// </summary>

                var activeProcess = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcess();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(activeProcess))
                    return activeProcess.getName();

                return "";
            },
            GetActiveProcessID: function () {
                /// <summary>
                /// Returns the ID of currently active BPF process on the form.
                /// </summary>

                var activeProcess = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcess();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(activeProcess))
                    return activeProcess.getId();

                return null;
            },
            GetActiveProcessStages: function () {
                /// <summary>
                /// Returns collection of stages of currently active BPF process on the form.
                /// </summary>

                var activeProcess = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcess();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(activeProcess))
                    return activeProcess.getStages();

                return null;
            },
            GetActiveProcessCurrentStage: function () {
                /// <summary>
                /// Returns current stage of currently active BPF process on the form.
                /// </summary>

                var activeProcess = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcess();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(activeProcess))
                    return activeProcess.getActiveStage();

                return null;                
            },            
            GetActiveProcessCurrentStageName: function () {
                /// <summary>
                /// Returns name of current stage of currently active BPF process on the form.
                /// </summary>

                var currentStage = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcessCurrentStage();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(currentStage))
                    return currentStage.getName();

                return "";
            },
            GetActiveProcessCurrentStageID: function () {
                /// <summary>
                /// Returns ID of current stage of currently active BPF process on the form.
                /// </summary>

                var currentStage = fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetActiveProcessCurrentStage();

                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(currentStage))
                    return currentStage.getId();

                return null;                
            },
            SetActiveProcess: function (processId, successCallBack, errorCallBack, saveChanges) {
                /// <summary>
                /// Sets active BPF process on the form.
                /// </summary>
                /// <param name="processId" type="string" required="true" >
                ///  Unique identifier of the process instance.
                /// </param>
                /// <param name="successCallBack" type="string" required="false" >
                ///  Function to execute after BPF process instance has been changed.
                /// </param>
                /// <param name="saveChanges" type="string" required="false" >
                ///  Indicates if changes should be saved before changing the BPF process instance.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(processId))
                    throw "UI.BPF.SetActiveProcess: parameter 'processId' must be defined!";

                if (saveChanges) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.Save(null, function () {
                        fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.process.setActiveProcess(processId, successCallBack);
                    }, function (err) {
                        if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                            errorCallBack(err);
                    });
                }
                else {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.process.setActiveProcess(processId, successCallBack);
                }
            },
            SetVisibility: function (isVisible) {
                /// <summary>
                /// Sets active BPF process visibility on the form.
                /// </summary>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(isVisible))
                    throw "UI.BPF.SetVisibility: parameter 'isVisible' must be defined!";

                fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().ui.process.setVisible(isVisible);
            },
            IsVisible: function () {
                /// <summary>
                /// Indicates if BPF process is visible on the form.
                /// </summary>

                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.BPF.GetProcessContext().getVisible();
            }
        },
        CustomPage: {
            OpenFromFormRibbon: function (entityName, entityId, customPageLogicalName, customPageType, widthInPercents, heightInPercents, dialogTitle) {
                /// <summary>
                /// Navigates to custom page from a form ribbon button.
                /// </summary>
                /// <param name="entityName" type="string" required="true" >
                ///  Logical name of the entity in which context the Custom Page will be openend.
                /// </param>
                /// <param name="entityId" type="string" required="true" >
                ///  Unique identifier of the entity in which context the Custom Page will be opened.
                /// </param>
                /// <param name="customPageLogicalName" type="string" required="true" >
                ///  Logical name of the Custom Page that should be opened.
                /// </param>
                /// <param name="customPageType" type="string" required="true" >
                ///  Type of the Custom Page to open. Use enum fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.
                /// </param>
                /// <param name="widthInPercents" type="integer" required="false" >
                ///  Width of the custom page to be shown in percents. If not given then a static value of 50% will be used for dialog and 500px will be used for side dialog.
                /// </param>
                /// <param name="heightInPercents" type="integer" required="false" >
                ///  Height of the custom page to be shown in percents. If not given then no height will be determined.
                /// </param>
                 /// <param name="dialogTitle" type="string" required="false" >
                ///  Custom title when type of the custom page is either a dialog or a side dialog.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                    throw "UI.CustomPage.OpenFromFormRibbon: parameter 'entityName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityId))
                    throw "UI.CustomPage.OpenFromFormRibbon: parameter 'entityId' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(customPageLogicalName))
                    throw "UI.CustomPage.OpenFromFormRibbon: parameter 'customPageLogicalName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(customPageType))
                    throw "UI.CustomPage.OpenFromFormRibbon: parameter 'customPageType' must be defined!";               

                if (Array.isArray(entityId)) {
                    entityId[0] = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(entityId[0]);
                }
                else {
                    entityId = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(entityId);
                }

                var pageInput = {
                    pageType: "custom",
                    name: customPageLogicalName,
                    entityName: entityName,
                    recordId: entityId,
                };
                
                var navigationOptions = { target: 1 };
                var widthGiven = !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(widthInPercents);
                var heightGiven = !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(heightInPercents);

                switch (customPageType) {

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.INLINE:
                        navigationOptions = { target: 1 };
                        break;

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.DIALOG:
                        navigationOptions.target = 2;
                        navigationOptions.position = 1;
                        if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(dialogTitle))
                            navigationOptions.title = dialogTitle;

                        if (widthGiven && heightGiven) {                            
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else if (widthGiven && !heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };                            
                        }
                        else if (!widthGiven && heightGiven) {                            
                            navigationOptions.width = { value: 50, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else {
                            navigationOptions.width = { value: 50, unit: "%" };
                        }
                        break;

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.SIDEDIALOG:
                        navigationOptions.target = 2;
                        navigationOptions.position = 2;
                        if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(dialogTitle))
                            navigationOptions.title = dialogTitle;

                        if (widthGiven && heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else if (widthGiven && !heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                        }
                        else if (!widthGiven && heightGiven) {
                            navigationOptions.width = { value: 500, unit: "px" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else {
                            navigationOptions.width = { value: 500, unit: "px" };
                        }
                        break;

                    default:
                        throw "UI.CustomPage.OpenFromFormRibbon: unsupported value '" + customPageType + "' for parameter 'customPageType'!";
                        break;
                }

                Xrm.Navigation.navigateTo(pageInput, navigationOptions, function () {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("Custom page '" + customPageLogicalName + "' opened succesfully for entity '" + entityName + "' with id '" + entityId + "'.");
                }, function (error) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("Error occurred when opening custom page '" + customPageLogicalName + "' for entity '" + entityName + "' with id '" + entityId + "': " + error);
                });
            },
            OpenFromGridRibbon: function (entityReferences, customPageLogicalName, customPageType, widthInPercents, heightInPercents, dialogTitle) {
                /// <summary>
                /// Navigates to custom page from a subgrid ribbon button.
                /// </summary>
                /// <param name="entityReferences" type="array of entityreferences" required="true" >
                ///  Selected record from the subgrid of the entity in which context the Custom Page will be opened. Eventhoug this is an array, only the first element will be used.
                ///  If multiple records has been selected, an error is thrown. 
                /// </param>
                /// <param name="customPageLogicalName" type="string" required="true" >
                ///  Logical name of the Custom Page that should be opened.
                /// </param>
                /// <param name="processId" type="string" required="true" >
                ///  Type of the Custom Page to open. Use enum fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.
                /// </param>
                /// <param name="widthInPercents" type="integer" required="false" >
                ///  Width of the custom page to be shown in percents. If not given then a static value of 50% will be used for dialog and 500px will be used for side dialog.
                /// </param>
                /// <param name="heightInPercents" type="integer" required="false" >
                ///  Height of the custom page to be shown in percents. If not given then no height will be determined.
                /// </param>
                /// <param name="dialogTitle" type="string" required="false" >
                ///  Custom title when type of the custom page is either a dialog or a side dialog.
                /// </param>

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityReferences))
                    return;

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(customPageLogicalName))
                    throw "UI.CustomPage.OpenFromGridRibbon: parameter 'customPageLogicalName' must be defined!";

                if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(customPageType))
                    throw "UI.CustomPage.OpenFromGridRibbon: parameter 'customPageType' must be defined!";   

                if (entityReferences.length > 1) {
                    var message = "Please select only one record to proceed.";
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.UI.Notification.ShowFormNotification(message, fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.FormNotification_Type.WARNING, 10);
                    return;
                }                

                var pageInput = {
                    pageType: "custom",
                    name: customPageLogicalName,                    
                    recordId: fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(entityReferences[0].Id),
                };

                navigationOptions = { target: 1 };
                var widthGiven = !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(widthInPercents);
                var heightGiven = !fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(heightInPercents);

                switch (customPageType) {

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.INLINE:
                        navigationOptions = { target: 1 };
                        break;

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.DIALOG:
                        navigationOptions.target = 2;
                        navigationOptions.position = 1;
                        if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(dialogTitle))
                            navigationOptions.title = dialogTitle;

                        if (widthGiven && heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else if (widthGiven && !heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                        }
                        else if (!widthGiven && heightGiven) {
                            navigationOptions.width = { value: 50, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else {
                            navigationOptions.width = { value: 50, unit: "%" };
                        }
                        break;

                    case fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.CustomPageType.SIDEDIALOG:
                        navigationOptions.target = 2;
                        navigationOptions.position = 2;
                        if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(dialogTitle))
                            navigationOptions.title = dialogTitle;

                        if (widthGiven && heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else if (widthGiven && !heightGiven) {
                            navigationOptions.width = { value: widthInPercents, unit: "%" };
                        }
                        else if (!widthGiven && heightGiven) {
                            navigationOptions.width = { value: 500, unit: "px" };
                            navigationOptions.height = { value: heightInPercents, unit: "%" };
                        }
                        else {
                            navigationOptions.width = { value: 500, unit: "px" };
                        }
                        break;

                    default:
                        throw "UI.CustomPage.OpenFromGridRibbon: unsupported value '" + customPageType + "' for parameter 'customPageType'!";
                        break;
                }

                Xrm.Navigation.navigateTo(pageInput, navigationOptions, function () {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("Custom page '" + customPageLogicalName + "' opened succesfully for entity '" + entityName + "' with id '" + entityId + "'.");
                }, function (error) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Info("Error occurred when opening custom page '" + customPageLogicalName + "' for entity references '" + JSON.stringify(entityReferences) + "': " + error);
                });
            }
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Context related functionalities
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        GetFormContext: function () {
            /// <summary>
            /// Returns form context. On the form script file there must be a global variable 'executionContext' that has been initialized.
            /// </summary>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(executionContext))
                throw "Unable to access formContext, make sure a global variable 'executionContext' is declared and execution context is passed to it during OnLoad event of the form!";

            // When functionalities executed from ribbon buttons require form context, we need to check if the global variable 'executionContext' is actually already the form context.
            // Since there is no out-of-the-box functionality to check it, we need to make an educated guess
            if (executionContext.getFormContext) {

                // It's likely an execution context
                return executionContext.getFormContext();

            } else if (executionContext.getAttribute) {

                // It's likely a form context already
                return executionContext;

            } else {

                // Could not determine the context type
                throw "Context.GetFormContext: type of parameter 'executionContext' is unknown!";
            }            
        },
        GetGlobalContext: function () {
            /// <summary>
            /// Returns global context. 
            /// See documentation: https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/xrm-utility/getglobalcontext
            /// </summary>

            return parent.Xrm.Utility.getGlobalContext();
        },
        GetClientURL: function () {
            /// <summary>
            /// Returns URL of the currently used client.
            /// </summary>

            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetGlobalContext().getClientUrl();
        },
        GetAPIVersion: function () {
            /// <summary>
            /// Returns API short version.
            /// </summary>

            var version = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetGlobalContext().getVersion();
            return version.substring(3, version.indexOf(".") - 1);
        },
        GetAPIUrl: function () {
            /// <summary>
            /// Returns API short version.
            /// </summary>
           
            var url = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetClientURL();            
            var api = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetAPIVersion();

            return url + "/api/data/" + api;
        },
        GetEntityMetadata: function (entityName) {
            /// <summary>
            /// Returns entity metadata
            /// </summary> 
            /// <param name="entityName" type="string" required="true" >
            ///  Logical name of the entity.
            /// </param>           

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                throw "Context.GetFieldSchemaName: parameter 'entityName' must be defined!";

            var orgURL = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetClientURL();
            var reqURL = orgURL + "/api/data/v9.2/EntityDefinitions?$select=LogicalName, SchemaName&$expand=Attributes&$filter=LogicalName eq '" + entityName + "'";

            var req = new XMLHttpRequest();
            req.open("GET", reqURL, true);
            req.setRequestHeader('Content-Type', 'application/json');

            return new Promise((resolve, reject) => {
                req.onreadystatechange = function () {
                    if (this.readyState === fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.XMLHttpRequest_ReadyState.DONE) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            resolve(JSON.parse(this.response));
                        }
                        else {
                            reject("Request failed: " + JSON.parse(this.responseText).error.code + " " + JSON.parse(this.responseText).error.message);
                        }
                    }
                };

                req.send();
            });
        },
        GetFieldMetadata: function (entityName, fieldName) {
            /// <summary>
            /// Returns schemaname of desired entity field.
            /// </summary> 
            /// <param name="entityName" type="string" required="true" >
            ///  Logical name of the entity.
            /// </param>
            /// <param name="fieldName" type="string" required="true" >
            ///  Logical name of the field.
            /// </param>  

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(entityName))
                throw "Context.GetFieldSchemaName: parameter 'entityName' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(fieldName))
                throw "Context.GetFieldSchemaName: parameter 'fieldName' must be defined!";

            var orgURL = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetClientURL();
            var reqURL = orgURL + "/api/data/v9.2/EntityDefinitions?$select=LogicalName,SchemaName&$expand=Attributes($select=LogicalName,SchemaName;$filter=LogicalName eq '" + fieldName + "')&$filter=LogicalName eq '" + entityName + "'";

            var req = new XMLHttpRequest();
            req.open("GET", reqURL, true);
            req.setRequestHeader('Content-Type', 'application/json');

            return new Promise((resolve, reject) => {
                req.onreadystatechange = function () {
                    if (this.readyState === fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.XMLHttpRequest_ReadyState.DONE) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            resolve(JSON.parse(this.response));
                        }
                        else {
                            reject("Request failed: " + JSON.parse(this.responseText).error.code + " " + JSON.parse(this.responseText).error.message);
                        }
                    }
                };

                req.send();
            });
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Current system user related functionalities
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser = fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        GetUserSettings: function () {
            /// <summary>
            /// Returns current users settings.
            /// </summary>

            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetGlobalContext().userSettings;
        },
        GetUserID: function () {
            /// <summary>
            /// Returns current users unique identifier.            
            /// </summary>

            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.GetUserSettings().userId;
        },
        GetUserName: function () {
            /// <summary>
            /// Returns current users name.     
            /// </summary>

            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.GetUserSettings().userName;
        },
        GetUserRoles: function () {
            /// <summary>
            /// Returns security roles assigned to current user.
            /// </summary>

            var roleNames = [];
            fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.GetUserSettings().roles.forEach(function (role) {
                roleNames.push(role.name);
            });

            return roleNames;            
        },
        HasRole: function (roleName) {
            /// <summary>
            /// Checks if the current user has a specific security role.
            /// </summary>
            /// <param name="roleName" type="string" required="true" >
            ///  Name of the security role to check.
            /// </param>  
            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(roleName))
                throw "CurrentUser.HasRole: parameter 'roleName' must be defined!";
            var roles = fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.GetUserRoles();

            for (var i = 0; i < roles.length; i++) {
                if (roles[i].toUpperCase() == roleName.toUpperCase())
                    return true;
            }            
            
            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger.Warning("CurrentUser.HasRoles: systemuser " + fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.GetUserID() + " does not have security role " + roleName);
            return false;
        },
        HasRoles: function (roleNames) {
            /// <summary>
            /// Checks if the current user has all specified security role.
            /// </summary>
            /// <param name="roleNames" type="string" required="true" >
            ///  Names of the security roles to check separated by a comma.
            /// </param>
            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(roleNames))
                throw "CurrentUser.HasRoles: parameter 'roleNames' must be defined!";
            var arrNames = roleNames.split(",");
            for (var i = 0; i < arrNames.length; i++) {
                if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.CurrentUser.HasRole(arrNames[i]))
                    return false;
            }
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Currently accessed records functionalities
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        GetRecord: function () {
            /// <summary>
            /// Returns the currently openened record.
            /// </summary> 
            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.entity;
        },
        GetRecordAttributes: function () {
            /// <summary>
            /// Returns the currently openened records attributes on the form.
            /// </summary> 
            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().attributes;
        },
        GetEntityReference: function () {
            /// <summary>
            /// Returns the currently openened as a entityreference.
            /// </summary> 
            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().getEntityReference();
        },
        GetId: function (removeBrackets) {
            /// <summary>
            /// Returns unique identifier of the currently openened record.
            /// </summary> 
            /// <param name="removeBrackets" type="boolean" required="false" >
            ///  Determines if brackets '{' and '}' will be removed from the unique identifier.
            /// </param>

            if (removeBrackets) {
                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.RemoveParenthesisFromGUID(
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().getId());
            }
            else {
                return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().getId();
            }
        },
        GetEntityName: function () {
            /// <summary>
            /// Returns the name of the currently openened entity.
            /// </summary> 
            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().getEntityName();
        },
        GetMetadata: function () {
            /// <summary>
            /// Returns metadata of the currently opened record
            /// </summary> 

            return fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetEntityMetadata(
                fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetEntityName());
        },
        Save: function (options, successCallBack, errorCallBack) {
            /// <summary>
            /// Saves the currently opened record asynchronously.
            /// </summary> 
            /// <param name="options" type="string" required="false" >
            ///  Options for the save event. Valid values are:
            /// - saveandclose
            /// - saveandnew
            /// </param>
            /// <param name="successCallBack" type="function" required="false" >
            ///  Function to call after the record have been successfully saved.
            /// </param>
            /// <param name="errorCallBack" type="function" required="false" >
            ///  Function to call after a failed save.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                throw "Record.Save: parameter 'successCallBack' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                throw "Record.Save: parameter 'errorCallBack' must be defined!";

            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Context.GetFormContext().data.save(options).then(successCallBack, errorCallBack);
        },
        SaveSync: function (options) {
            /// <summary>
            /// Saves the currently opened record synchronously.
            /// </summary> 
            /// <param name="options" type="string" required="false" >
            ///  Options for the save event. Valid values are:
            /// - saveandclose
            /// - saveandnew
            /// </param>

            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Record.GetRecord().save(options);
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Power Automate related functionalities
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.PowerAutomate = fmfi.PowerPlatform.DeveloperToolkit.JsLib.PowerAutomate || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        Execute: async function (url, payLoad, awaitExecution, message) {
            // <summary>
            /// Executes a Power Automate flow.
            /// </summary> 
            /// <param name="url" type="string" required="true" >
            /// URL of the Power Automate flow.
            /// </param>
            /// <param name="payLoad" type="object" required="false" >
            /// Parameters that might be needed in the Power Automate.
            /// </param>
            /// <param name="awaitExecution" type="boolean" required="true" >
            /// Indicates if the execution should be awaited. In this case the Power Automate must return a HTTP response.
            /// </param>
            /// <param name="message" type="string" required="false" >
            /// Loading message that is shown to the user during the execution of the Power Automate. Mandatory if execution should be awaited.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(url))
                throw "PowerAutomate.Execute: parameter 'url' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(awaitExecution))
                throw "PowerAutomate.Execute: parameter 'awaitExecution' must be defined!";

            if (awaitExecution && fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                throw "PowerAutomate.Execute: parameter 'message' must be defined when parameter 'awaitExecution' = true!";

            function GetResponse(req, payload, awaitExecution, message) {
                return new Promise(function (resolve, reject) {

                    req.onreadystatechange = function () {
                        if (this.readyState === fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.XMLHttpRequest_ReadyState.DONE) {
                            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.CloseProgressBar();
                            req.onreadystatechange = null;
                            if (this.status === 200) {
                                resolve(this.response);
                            }
                            else {
                                reject(this.response);
                            }
                        }
                    };

                    if (awaitExecution)
                        fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.ShowProgressBar(message);

                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(payload) ? req.send() : req.send(JSON.stringify(payload));
                });
            };

            var req = new XMLHttpRequest();
            req.open("POST", url, true);
            req.setRequestHeader('Content-Type', 'application/json');

            var response = awaitExecution ? await GetResponse(req, payLoad, true, message) : GetResponse(req, payLoad, false, null);

            return response;
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// HTTP request related functionalities
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.HTTP = fmfi.PowerPlatform.DeveloperToolkit.JsLib.HTTP || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Private variables and functions 
    ///////////////////////////////////////////////////////////////////////////////////////

    function getResponse(req, payload, awaitExecution, message, expectedResponseCode) {
        return new Promise(function (resolve, reject) {

            req.onreadystatechange = function () {
                if (this.readyState === fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums.XMLHttpRequest_ReadyState.DONE) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.CloseProgressBar();
                    req.onreadystatechange = null;
                    if (this.status === expectedResponseCode) {
                        resolve(this.response);
                    }
                    else {
                        reject("Request failed: " + this.status + " " + this.statusText);
                    }
                }
            };

            if (awaitExecution)
                fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.ShowProgressBar(message);

            fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(payload) ? req.send() : req.send(JSON.stringify(payload));
        });
    };

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {

        POST: async function (url, headers, payLoad, awaitExecution, message, expectedResponseCode) {
            // <summary>
            /// Executes a POST HTTP request.
            /// </summary> 
            /// <param name="url" type="string" required="true" >
            /// URL of the request.
            /// </param>
            /// <param name="headers" type="object (Map)" required="false" >
            /// If the request expects any headers besides Content-Type they should be given here.
            /// Use Map object, example:
            /// var map = new Map();
            /// map.set('ID', 1234);           
            /// </param>
            /// <param name="payLoad" type="object" required="false" >
            /// Request payload object that might be needed.
            /// </param>
            /// <param name="awaitExecution" type="boolean" required="true" >
            /// Indicates if the execution should be awaited. In this case the request must return a HTTP response.
            /// </param>
            /// <param name="message" type="string" required="false" >
            /// Loading message that is shown to the user during the execution of the request. Mandatory if execution should be awaited.
            /// </param>
            /// <param name="expectedResponseCode" type="integer" required="true" >
            /// Response code that should be returned by the request if executed successfully.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(url))
                throw "HTTP.POST: parameter 'url' must be defined!";

            if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(headers) && !(headers instanceof Map))
                throw "HTTP.POST: parameter 'headers' type is invalid! Type should be Map!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(awaitExecution))
                throw "HTTP.POST: parameter 'awaitExecution' must be defined!";

            if (awaitExecution && fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                throw "HTTP.POST: parameter 'message' must be defined when parameter 'awaitExecution' = true!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(expectedResponseCode))
                throw "HTTP.POST: parameter 'expectedResponseCode' must be defined!";

            var req = new XMLHttpRequest();
            req.open("POST", url, true);
            req.setRequestHeader('Content-Type', 'application/json');

            if (headers != null && headers.size > 0) {
                for (let [key, value] of headers) {
                    req.setRequestHeader(key, value);
                }
            }

            var response = awaitExecution ? await getResponse(req, payLoad, true, message, expectedResponseCode) : getResponse(req, payLoad, false, null, expectedResponseCode);

            return response;
        },
        PUT: async function (url, headers, payLoad, awaitExecution, message, expectedResponseCode) {
            // <summary>
            /// Executes a PUT HTTP request.
            /// </summary> 
            /// <param name="url" type="string" required="true" >
            /// URL of the request.
            /// </param>
            /// <param name="headers" type="object (Map)" required="false" >
            /// If the request expects any headers besides Content-Type they should be given here.
            /// Use Map object, example:
            /// var map = new Map();
            /// map.set('ID', 1234);           
            /// </param>
            /// <param name="payLoad" type="object" required="false" >
            /// Request payload object that might be needed.
            /// </param>
            /// <param name="awaitExecution" type="boolean" required="true" >
            /// Indicates if the execution should be awaited. In this case the request must return a HTTP response.
            /// </param>
            /// <param name="message" type="string" required="false" >
            /// Loading message that is shown to the user during the execution of the request. Mandatory if execution should be awaited.
            /// </param>
            /// <param name="expectedResponseCode" type="integer" required="true" >
            /// Response code that should be returned by the request if executed successfully.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(url))
                throw "HTTP.PUT: parameter 'url' must be defined!";

            if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(headers) && !(headers instanceof Map))
                throw "HTTP.PUT: parameter 'headers' type is invalid! Type should be Map!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(payLoad))
                throw "HTTP.PUT: parameter 'payload' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(awaitExecution))
                throw "HTTP.PUT: parameter 'awaitExecution' must be defined!";

            if (awaitExecution && fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                throw "HTTP.PUT: parameter 'message' must be defined when parameter 'awaitExecution' = true!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(expectedResponseCode))
                throw "HTTP.PUT: parameter 'expectedResponseCode' must be defined!";

            var req = new XMLHttpRequest();
            req.open("PUT", url, true);
            req.setRequestHeader('Content-Type', 'application/json');

            if (headers != null && headers.size > 0) {
                for (let [key, value] of headers) {
                    req.setRequestHeader(key, value);
                }
            }

            var response = awaitExecution ? await getResponse(req, payLoad, true, message, expectedResponseCode) : getResponse(req, payLoad, false, null, expectedResponseCode);

            return response;

        },
        GET: async function (url, headers, message, expectedResponseCode) {
            // <summary>
            /// Executes a GET HTTP request.
            /// </summary> 
            /// <param name="url" type="string" required="true" >
            /// URL of the request.
            /// </param>
            /// <param name="headers" type="object (Map)" required="false" >
            /// If the request expects any headers besides Content-Type they should be given here.
            /// Use Map object, example:
            /// var map = new Map();
            /// map.set('ID', 1234);           
            /// </param>
            /// <param name="message" type="string" required="true" >
            /// Loading message that is shown to the user during the execution of the request. 
            /// </param>
            /// <param name="expectedResponseCode" type="integer" required="true" >
            /// Response code that should be returned by the request if executed successfully.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(url))
                throw "HTTP.GET: parameter 'url' must be defined!";

            if (!fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(headers) && !(headers instanceof Map))
                throw "HTTP.GET: parameter 'headers' type is invalid! Type should be Map!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                throw "HTTP.GET: parameter 'message' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(expectedResponseCode))
                throw "HTTP.GET: parameter 'expectedResponseCode' must be defined!";

            var req = new XMLHttpRequest();
            req.open("GET", url, true);            

            if (headers != null && headers.size > 0) {
                for (let [key, value] of headers) {
                    req.setRequestHeader(key, value);
                }
            }

            var response = await getResponse(req, null, true, message, expectedResponseCode);

            return response;
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Common helper functionalities 
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        IsNullOrUndefined: function (param) {
            /// <summary>
            /// Checks if the given parameter is either null or undefined.
            /// </summary>
            /// <param name="param" type="object" required="true" >
            ///  Parameter to execute a null check.           
            /// </param>

            if (typeof param === 'undefined' || param === null)
                return true;

            if (typeof param === 'string' && param.length === 0)
                return true;

            return false;
        },
        RemoveParenthesisFromGUID: function (id) {
            /// <summary>
            /// Removes parenthesis (curly) from a GUID value.
            /// </summary>
            /// <param name="id" type="string" required="true" >
            ///  GUID value from which the parenthesis should be removed.           
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(id))
                return null;

            id = id.replace("{", "");
            id = id.replace("}", "");

            return id;
        },
        GenerateGUID: function () {
            /// <summary>
            /// Generates a new GUID.
            /// </summary>
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        ShowProgressBar: function (message) {
            // <summary>
            /// Shows a loading screen which blocks UI during a loading session.
            /// </summary> 
            /// <param name="message" type="string" required="false" >
            /// Message to be shown during the loading.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                message = "Loading, please wait...";

            Xrm.Utility.showProgressIndicator(message);
        },
        CloseProgressBar: function () {
            // <summary>
            /// Closes the UI blocking loading screen.
            /// </summary> 

            Xrm.Utility.closeProgressIndicator();
        },
        GetEnvironmentVariable: function (variableName, successCallBack, errorCallBack) {
            /// <summary>
            /// Retrieves an environment variable via name.
            /// </summary> 
            /// <param name="variableName" type="string" required="true" >
            /// Name of the Environment Variable to search.
            /// </param>            
            /// <param name="successCallBack" type="function" required="true" >
            ///  Function to call after the record have been successfully environment variable has been successfully retrieved.
            /// </param>
            /// <param name="errorCallBack" type="function" required="true" >
            ///  Function to call after retrieving the environment variable has failed. Error message will be returned as a parameter.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(variableName))
                throw "Helper.GetEnvironmentVariable: parameter 'variableName' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(successCallBack))
                throw "Helper.GetEnvironmentVariable: parameter 'successCallBack' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(errorCallBack))
                throw "Helper.GetEnvironmentVariable: parameter 'errorCallBack' must be defined!";

            function getPromise(entity, query) {
                return new Promise(function (resolve, reject) {
                    fmfi.PowerPlatform.DeveloperToolkit.JsLib.WebAPI.CRUD.RetrieveMultiple(entity, query, null, function (result) {

                        if (result.entities.length == 0)
                            reject("Helper.GetEnvironmentVariable: No Environment Variable found with name '" + variableName + "'");

                        if (result.entities.length > 1)
                            reject("Helper.GetEnvironmentVariable: Multiple Environment Variables found with name '" + variableName + "'");

                        var record = result.entities.length == 0 || result.entities.length > 1 ? null : result.entities[0];
                        resolve(record);

                    }, reject);
                });
            };

            var entity = "environmentvariablevalue";
            var query = "?$select=value&$expand=EnvironmentVariableDefinitionId&$filter=(EnvironmentVariableDefinitionId/schemaname%20eq%20'" + variableName + "')";

            getPromise(entity, query).then(record => {
                successCallBack(record);
            }, err => {
                errorCallBack(err);
            });
        },
        ExecuteAndAwaitAsync: async function (functionToExecute, functionParam, successCallBack, errorCallBack) {
            /// <summary>
            /// Executes and awaits until the function has been successfully executed.
            /// </summary> 
            /// <param name="functionToExecute" type="function" required="true" >
            /// Function to execute.
            /// </param>   
            /// <param name="functionParam" type="object" required="false" >
            /// Parameter to pass for the executable function.
            /// </param>   
            /// <param name="successCallBack" type="function" required="true" >
            ///  Function to call after the main function have been successfully executed.
            /// </param>
            /// <param name="errorCallBack" type="function" required="true" >
            ///  Function to call after main function has failed. Error message will be returned as a parameter.
            /// </param>

            const executeAsync = new Promise((resolve, reject) => {

                try {
                    var res = functionToExecute(functionParam);
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });

            await executeAsync
                .then(successCallBack, errorCallBack);
        },
        GetWebresourceLocalizedString: function (webresourceName, key) {
            /// <summary>
            /// Returns the localized string for a given key associated with the specified web resource.
            /// https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getresourcestring
            /// </summary>
            /// <param name="webresourceName" type="string" required="true" >
            /// The name of the web resource.
            /// </param>
            /// <param name="key" type="string" required="true" >
            /// The key for the localized string.
            /// </param>

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(webresourceName))
                throw "Helper.GetWebresourceLocalizedString: parameter 'webresourceName' must be defined!";

            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(key))
                throw "Helper.GetWebresourceLocalizedString: parameter 'key' must be defined!";

            return Xrm.Utility.getResourceString(webresourceName, key)
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Logger 
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Logger || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        Info: function (message) {
            /// <summary>
            /// Logs an info message into the browser console.
            /// </summary>
            /// <param name="message" type="string" required="true" >
            ///  Message to log.           
            /// </param>
            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                return;
            window.console.log(message);
        },
        Warning: function (message) {
            /// <summary>
            /// Logs a warning message into the browser console.
            /// </summary>
            /// <param name="message" type="string" required="true" >
            ///  Message to log.           
            /// </param>
            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                return;
            window.console.warn(message);
        },
        Error: function (message) {
            /// <summary>
            /// Logs a error message into the browser console.
            /// </summary>
            /// <param name="message" type="string" required="true" >
            ///  Message to log.           
            /// </param>
            if (fmfi.PowerPlatform.DeveloperToolkit.JsLib.Helper.IsNullOrUndefined(message))
                return;
            window.console.error(message);
        }
    };
}();

//////////////////////////////////////////////////////////////////////////////////////////
/// Enumerations used within the JS components
//////////////////////////////////////////////////////////////////////////////////////////

fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums = fmfi.PowerPlatform.DeveloperToolkit.JsLib.Enums || function () {

    ///////////////////////////////////////////////////////////////////////////////////////
    /// Public interface for access 
    ///////////////////////////////////////////////////////////////////////////////////////

    return {
        EntityDataModel_PrimitiveType: {
            BINARY: 'Edm.Binary',
            BOOLEAN: 'Edm.Boolean',
            BYTE: 'Edm.Byte',
            DATETIME: 'Edm.DateTime',
            DECIMAL: 'Edm.Decimal',
            DOUBLE: 'Edm.Double',
            GUID: 'Edm.Guid',
            INT16: 'Edm.Int16',
            INT32: 'Edm.Int32',
            INT64: 'Edm.Int64',
            SBYTE: 'Edm.SByte',
            SINGLE: 'Edm.Single',
            STRING: 'Edm.String',
            TIME: 'Edm.Time',
            DATETIMEOFFSET: 'Edm.DateTimeOffset'
        },
        EntityDataModel_StructuralType: {
            UNKNOWN: 0,
            PRIMITIVETYPE: 1,
            COMPLEXTYPE: 2,
            ENUMERATIONTYPE: 3,
            COLLECTION: 4,
            ENTITYTYPE: 5
        },
        WebAPI_RequestType: {
            ACTION: 0,
            FUNCTION: 1
        },
        SidePane_State: {
            COLLAPSED: 0,
            EXPANDED: 1
        },
        FormNotification_Type: {
            ERROR: 'ERROR',
            WARNING: 'WARNING',
            INFO: "WARNING"
        },
        GlobalNotification_Type: {
            SUCCESS: 1,
            ERROR: 2,
            WARNING: 3,
            INFORMATION: 4
        },
        FormType: {
            UNDEFINED: 0,
            CREATE: 1,
            UPDATE: 2,
            READONLY: 3,
            DISABLED: 4,
            BULKEDIT: 5,
        },
        FieldRequirement_Level: {
            NONE: 'none',
            REQUIRED: 'required',
            RECOMMENDED: 'recommended'
        },
        Field_SubmitModes: {
            ALWAYS: 'always',
            NEVER: 'never',
            DIRTY: 'dirty'
        },
        InAppNotification_IconType: {
            INFO: 100000000,
            SUCCESS: 100000001,
            FAILURE: 100000002,
            WARNING: 100000003,
            MENTION: 100000004,
            CUSTOM: 100000005,
        },
        InAppNotification_NavigationTarget: {
            DIALOG: "dialog",
            INLINE: "inline",
            NEWWINDOW: "newWindow"
        },
        XMLHttpRequest_ReadyState: {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4,
        },
        Field_AttributeType: {
            BOOLEAN: "boolean",
            DATETIME: "datetime",
            DECIMAL: "decimal",
            DOUBLE: "double",
            INTEGER: "integer",
            LOOKUP: "lookup",
            MEMO: "memo",
            MONEY: "money",
            CHOICES: "multiselectoptionset",
            CHOICE: "optionset",
            STRING: "string",
        },
        CustomPageType: {
            INLINE: 1,
            DIALOG: 2,
            SIDEDIALOG: 3,
        }
    };
}();

