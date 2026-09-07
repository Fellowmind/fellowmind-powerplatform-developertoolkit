using System;
using Microsoft.Xrm.Sdk;

namespace Fellowmind
{
    public sealed class CanonicalPhoneNumberPlugin : IPlugin
    {
        public const string CustomApiName = "fmfi_CanonicalPhoneNumber";
        public const string ExistingPhoneNumberParameter = "fmfi_CanonicalPhoneNumberAPI_ExistingPhoneNumber";
        public const string CountryCodeParameter = "fmfi_CanonicalPhoneNumberAPI_CountryCode";
        public const string SuccessProperty = "fmfi_CanonicalPhoneNumberAPI_Success";
        public const string ResponseProperty = "fmfi_CanonicalPhoneNumberAPI_Response";

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new InvalidPluginExecutionException(nameof(serviceProvider));
            }

            ITracingService tracingService = GetRequiredService<ITracingService>(serviceProvider);
            IPluginExecutionContext context =
                GetRequiredService<IPluginExecutionContext>(serviceProvider);

            new CanonicalPhoneNumberOperation().Execute(
                context.InputParameters,
                context.OutputParameters,
                tracingService);
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
