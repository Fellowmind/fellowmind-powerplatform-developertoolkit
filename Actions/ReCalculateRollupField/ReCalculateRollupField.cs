using System;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;

namespace Fellowmind
{
    public sealed class ReCalculateRollupFieldPlugin : IPlugin
    {
        public const string CustomApiName = "fmfi_ReCalculateRollupField";
        public const string EntityNameParameter = "fmfi_recalculaterollupfield_EntityName";
        public const string IdParameter = "fmfi_recalculaterollupfield_Id";
        public const string FieldNameParameter = "fmfi_recalculaterollupfield_FieldName";

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new InvalidPluginExecutionException(nameof(serviceProvider));
            }

            ITracingService tracingService = GetRequiredService<ITracingService>(serviceProvider);
            IPluginExecutionContext context = GetRequiredService<IPluginExecutionContext>(serviceProvider);
            IOrganizationServiceFactory serviceFactory = GetRequiredService<IOrganizationServiceFactory>(serviceProvider);

            string entityName = GetRequiredStringInput(context, EntityNameParameter);
            Guid id = GetRequiredGuidInput(context, IdParameter);
            string fieldName = GetRequiredStringInput(context, FieldNameParameter);

            tracingService.Trace(
                "Executing {0} for {1} record {2}, field {3}.",
                CustomApiName,
                entityName,
                id,
                fieldName);

            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            service.Execute(new CalculateRollupFieldRequest
            {
                Target = new EntityReference(entityName, id),
                FieldName = fieldName
            });

            tracingService.Trace("{0} completed successfully.", CustomApiName);
        }

        internal static string GetRequiredStringInput(IPluginExecutionContext context, string parameterName)
        {
            if (context == null)
            {
                throw new InvalidPluginExecutionException(nameof(context));
            }

            if (!context.InputParameters.Contains(parameterName)
                || !(context.InputParameters[parameterName] is string value)
                || string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidPluginExecutionException(
                    $"'{parameterName}' is missing, empty, or has an invalid type.");
            }

            return value.Trim();
        }

        internal static Guid GetRequiredGuidInput(IPluginExecutionContext context, string parameterName)
        {
            if (context == null)
            {
                throw new InvalidPluginExecutionException(nameof(context));
            }

            if (!context.InputParameters.Contains(parameterName)
                || !(context.InputParameters[parameterName] is Guid value)
                || value == Guid.Empty)
            {
                throw new InvalidPluginExecutionException(
                    $"'{parameterName}' is missing, empty, or has an invalid type.");
            }

            return value;
        }

        private static T GetRequiredService<T>(IServiceProvider serviceProvider)
            where T : class
        {
            T service = serviceProvider.GetService(typeof(T)) as T;
            if (service == null)
            {
                throw new InvalidPluginExecutionException(
                    $"The required service '{typeof(T).Name}' is unavailable.");
            }

            return service;
        }
    }
}
