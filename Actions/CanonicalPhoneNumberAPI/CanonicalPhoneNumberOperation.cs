using System;
using Microsoft.Xrm.Sdk;

namespace Fellowmind
{
    public sealed class CanonicalPhoneNumberOperation
    {
        private readonly ICanonicalPhoneNumberService canonicalPhoneNumberService;

        public CanonicalPhoneNumberOperation()
            : this(new CanonicalPhoneNumberService())
        {
        }

        public CanonicalPhoneNumberOperation(
            ICanonicalPhoneNumberService canonicalPhoneNumberService)
        {
            this.canonicalPhoneNumberService = canonicalPhoneNumberService
                ?? throw new ArgumentNullException(nameof(canonicalPhoneNumberService));
        }

        public void Execute(
            ParameterCollection inputParameters,
            ParameterCollection outputParameters,
            ITracingService tracingService)
        {
            if (inputParameters == null)
            {
                throw new ArgumentNullException(nameof(inputParameters));
            }

            if (outputParameters == null)
            {
                throw new ArgumentNullException(nameof(outputParameters));
            }

            if (tracingService == null)
            {
                throw new ArgumentNullException(nameof(tracingService));
            }

            string existingPhoneNumber = GetStringInput(
                inputParameters,
                CanonicalPhoneNumberPlugin.ExistingPhoneNumberParameter);
            string countryCode = GetStringInput(
                inputParameters,
                CanonicalPhoneNumberPlugin.CountryCodeParameter);

            tracingService.Trace(
                "{0} started for country {1}.",
                CanonicalPhoneNumberPlugin.CustomApiName,
                NormalizeCountryForTrace(countryCode));

            CanonicalPhoneNumberResult result =
                canonicalPhoneNumberService.Canonicalize(existingPhoneNumber, countryCode);

            outputParameters[CanonicalPhoneNumberPlugin.SuccessProperty] = result.Success;
            outputParameters[CanonicalPhoneNumberPlugin.ResponseProperty] = result.Response;

            tracingService.Trace(
                "{0} completed with outcome {1}.",
                CanonicalPhoneNumberPlugin.CustomApiName,
                result.Outcome);
        }

        private static string GetStringInput(
            ParameterCollection inputParameters,
            string parameterName)
        {
            return inputParameters.Contains(parameterName)
                ? inputParameters[parameterName] as string
                : null;
        }

        private static string NormalizeCountryForTrace(string countryCode)
        {
            if (string.IsNullOrWhiteSpace(countryCode))
            {
                return "<missing>";
            }

            string normalized = countryCode.Trim().ToUpperInvariant();
            return normalized.Length == 3 ? normalized : "<malformed>";
        }
    }
}
