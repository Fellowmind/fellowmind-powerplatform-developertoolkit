using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Newtonsoft.Json;

namespace FetchXMLHelperAPI
{
    public class FetchXMLHelper : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Obtain the tracing service
            ITracingService tracingService =
            (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            // Obtain the execution context from the service provider.  
            IPluginExecutionContext context = (IPluginExecutionContext)
                serviceProvider.GetService(typeof(IPluginExecutionContext));

            //Create an Organization Service
            IOrganizationServiceFactory serviceFactory = serviceProvider.GetService(typeof(IOrganizationServiceFactory)) as IOrganizationServiceFactory;
            IOrganizationService service = serviceFactory.CreateOrganizationService(null);

            try
            {
                tracingService.Trace("Starting FetchXMLHelper");
                // get the input parameters
                string fetchXML = (string)context.InputParameters["FetchXML"];

                tracingService.Trace("FetchXML: " + fetchXML);

                // create the FetchXML query to dataverse
                var query = new FetchExpression(fetchXML);

                EntityCollection results = service.RetrieveMultiple(query);
                tracingService.Trace("Number of records retrieved: " + results.Entities.Count);

                List<Dictionary<string, object>> records = new List<Dictionary<string, object>>();

                foreach (var entity in results.Entities)
                {
                    var entityDict = new Dictionary<string, object>();

                    foreach (var attr in entity.Attributes)
                    {
                        string key = attr.Key;
                        object value = attr.Value;

                        // Handle lookup logical name
                        if (entity.Attributes.ContainsKey(key + "@Microsoft.Dynamics.CRM.lookuplogicalname"))
                        {
                            entityDict[key + "_logicalName"] = entity.Attributes[key + "@Microsoft.Dynamics.CRM.lookuplogicalname"];
                        }

                        // Handle formatted value
                        if (entity.FormattedValues.ContainsKey(key))
                        {
                            entityDict[key + "_formatted"] = entity.FormattedValues[key];
                        }

                        entityDict[key] = value;
                    }

                    records.Add(entityDict);
                }

                // If you want to output as JSON:
                string outputJson = JsonConvert.SerializeObject(records, Formatting.Indented);
                context.OutputParameters["output"] = outputJson;


            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);

            }
        }
    }
}
