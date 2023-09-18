/// Make sure you reference your full library here correctly so that your VS intelligence works. If path below is not correct then fix it according to your project.
/// <reference path="../source/fmfi.PowerPlatform.DeveloperToolkit.JsLib.js" />

// Default namespace is quite long so we can cut it short.
var JsLib = fmfi?.PowerPlatform?.DeveloperToolkit.JsLib;

// Make sure you reference your minified library here correctly so that it can be dynamically loaded properly.
const JsLibMinPath = "/WebResources/fmfi_/Fellowmind.PowerPlatform.DeveloperToolkit.JS/fmfi.PowerPlatform.DeveloperToolkit.JsLib.min.js";

// Define the global execution context that the library requires and initialize it in the form OnLoad event.
var executionContext;

// Namespacing used in the entitys form. Replace the placeholder 'EntityName' with your entity.
var fmfi = window.fmfi || {};
fmfi.EntityName = fmfi.EntityName || function () {

    ///////////////////////////////////////////////////////////////////
    /// Private variables/functions common to all public interfaces ///
    ///////////////////////////////////////////////////////////////////

    var registerOnChangeEvents = function () {
        // <summary>
        // Adds listeners for the defined controls that will be triggered during OnChange event.
        // </summary>

        // Initialize listeners for field, form, tab, grid or BPF events here. For example:
        JsLib.UI.Listeners.Field.RegisterOnChangeEvent("fmfi_yourfieldname", fmfi.EntityName.Form.fmfi_yourfieldnameOnChange);
    }

    var LoadDependentLibraries = function (libPath) {
        // <summary>
        /// Loads dependent minified JS library so that it doesn't need to be referred in the header
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

    //////////////////////////////////////////////////////////////////
    /// Public interface                                           ///
    //////////////////////////////////////////////////////////////////

    return {

        Form: {
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

                    // Initialize listeners only during the initial form load. 
                    if (executionContext.getEventArgs().getDataLoadState() == 1)
                        registerOnChangeEvents();

                });
            },
            fmfi_yourfieldnameOnChange: function () {
                // Do something
            }
        },
        Ribbon: {
            // Do something...
        }
    };
}();

