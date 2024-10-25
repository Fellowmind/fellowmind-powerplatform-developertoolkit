using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using ExecuteHttpTrigger.Models;
using System.Net.Http;
using System.Net;
using Microsoft.Xrm.Sdk.Query;
using System.Net.Http.Headers;
using System.Web.UI.WebControls;
using System.Text.Json.Serialization;

namespace ExecuteHttpTrigger
{
    public class ExecuteHttpTriggerAction : CodeActivity
    {
        [Input("Oletuksena env variable")]
        public InArgument<string> ConfigurationTable { get; set; }
        [Input("Logiikassa yritetään hakea power automaten urli joko env variablesta tai sitten konfiguraatiotaulun tietyn nimisen rivin tekstikentästä."), RequiredArgument]
        public InArgument<string> ConfigurationRowName { get; set; }
        [Input("Jsonia stringified."), RequiredArgument]
        public InArgument<string> Body { get; set; }

        [Output("Powerautomate vastaus"), RequiredArgument]
        public OutArgument<string> Message { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            ITracingService tracingService = context.GetExtension<ITracingService>();
            IWorkflowContext workflowContext = context.GetExtension<IWorkflowContext>();
            IOrganizationServiceFactory serviceFactory = context.GetExtension<IOrganizationServiceFactory>();
            IOrganizationService service = serviceFactory.CreateOrganizationService(null);

            string configurationTable = ConfigurationTable.Get(context) ?? "fmfi_developerkitconfiguration";

            string configurationRowName = ConfigurationRowName.Get(context);
            string body = Body.Get(context);

            var usesConfigurationEntity = configurationTable.ToLower().Contains("developerkitconfiguration");

            tracingService.Trace($"ExecuteHttpTriggerAction executed with args, ConfigurationTable: {configurationTable}, ConfigurationRowName: {configurationRowName}, Body: {body}");

            var paUrl = "";

            tracingService.Trace($"usesConfigurationEntity {usesConfigurationEntity}");

            if(string.IsNullOrEmpty(configurationRowName))
            {
                throw new InvalidPluginExecutionException("ConfigurationRowName is empty.");
            }

            if (usesConfigurationEntity)
            {
                var query = new QueryExpression(configurationTable);
                query.ColumnSet.AddColumn("fmfi_textvalue");
                query.Criteria.AddCondition("fmfi_name", ConditionOperator.Equal, configurationRowName);
                var queryResult = service.RetrieveMultiple(query);
                var configurationEntity = queryResult.Entities.FirstOrDefault();
                if(configurationEntity != null)
                    configurationEntity.TryGetAttributeValue<string>("fmfi_textvalue", out paUrl);
            }
            else
            {
                // Set Condition Values
                var query_schemaname = configurationRowName;

                // Instantiate QueryExpression query
                var query = new QueryExpression("environmentvariabledefinition");
                // Add columns to query.ColumnSet
                query.ColumnSet.AddColumn("schemaname");

                // Add conditions to query.Criteria
                query.Criteria.AddCondition("schemaname", ConditionOperator.Equal, query_schemaname);

                // Add link-entity envvariable
                var envvariable = query.AddLink("environmentvariablevalue", "environmentvariabledefinitionid", "environmentvariabledefinitionid");
                envvariable.EntityAlias = "env";
                // Add columns to envvariable.Columns
                envvariable.Columns.AddColumn("value");


                var queryResult = service.RetrieveMultiple(query);

                var configurationEntity = queryResult.Entities.FirstOrDefault();

                if (configurationEntity != null)
                {
                    var aliasedValue = configurationEntity.GetAttributeValue<AliasedValue>("env.value");
                    paUrl = (string)aliasedValue.Value;
                }
            }

            if (String.IsNullOrEmpty(paUrl))
            {
                throw new Exception("Power automate flow url is empty.");
            }

            var httpClient = new HttpClient();
            var httpContent = new StringContent(body, Encoding.UTF8, "application/json");

            var response = httpClient.PostAsync(paUrl, httpContent).Result;
            var resJson = response.Content.ReadAsStringAsync().Result;

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Power automate flow did not run successfully: {response.StatusCode} {resJson}");
            }

            var options = new JsonSerializerOptions
            {
                Converters = { new BoolConverter() },
            };
            var message = JsonSerializer.Deserialize<MessageObject>(resJson, options);

            if (!message.success)
            {
                throw new Exception($"Power automate flow did not run successfully: {message.message}");
            }

            string messageJson = JsonSerializer.Serialize(message);

            tracingService.Trace($"messageJson: {messageJson}");

            Message.Set(context, messageJson);
        }
    }


    public class BoolConverter : JsonConverter<bool>
    {
        public override bool Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.True:
                    return true;
                case JsonTokenType.False:
                    return false;
                case JsonTokenType.String:
                    if (bool.TryParse(reader.GetString(), out var b))
                    {
                        return b;
                    }
                    else
                    {
                        throw new JsonException();
                    }
                case JsonTokenType.Number:
                    if (reader.TryGetInt64(out long l))
                    {
                        return Convert.ToBoolean(l);
                    }
                    else if (reader.TryGetDouble(out double d))
                    {
                        return Convert.ToBoolean(d);
                    }
                    else
                    {
                        return false;
                    }
                default:
                    throw new JsonException();
            }
        }

        public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
        {
            writer.WriteBooleanValue(value);
        }
    }
}