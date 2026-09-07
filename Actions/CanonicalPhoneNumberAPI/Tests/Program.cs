using System;
using System.Collections.Generic;
using System.Linq;
using Fellowmind;
using Microsoft.Xrm.Sdk;

namespace Fellowmind.Tests
{
    internal static class Program
    {
        private static readonly List<string> Failures = new List<string>();

        private static int Main()
        {
            Run("Country metadata integrity", CountryMetadataIntegrity);
            Run("National Finnish number", NationalFinnishNumber);
            Run("Formatted Finnish number", FormattedFinnishNumber);
            Run("National Hungarian number", NationalHungarianNumber);
            Run("National US number", NationalUsNumber);
            Run("International country replacement", InternationalCountryReplacement);
            Run("Double-zero country replacement", DoubleZeroCountryReplacement);
            Run("Parenthesized source trunk prefix", ParenthesizedSourceTrunkPrefix);
            Run("Italian significant zero", ItalianSignificantZero);
            Run("Variable-length calling code", VariableLengthCallingCode);
            Run("Missing phone number", MissingPhoneNumber);
            Run("Missing country code", MissingCountryCode);
            Run("Malformed country code", MalformedCountryCode);
            Run("Unsupported country code", UnsupportedCountryCode);
            Run("Unsupported calling code", UnsupportedCallingCode);
            Run("Unsupported characters", UnsupportedCharacters);
            Run("Misplaced plus", MisplacedPlus);
            Run("Unbalanced parentheses", UnbalancedParentheses);
            Run("Empty parentheses", EmptyParentheses);
            Run("Invalid target length", InvalidTargetLength);
            Run("Short code rejected", ShortCodeRejected);
            Run("Emergency number rejected", EmergencyNumberRejected);
            Run("Extension rejected", ExtensionRejected);
            Run("Operation writes outputs", OperationWritesOutputs);
            Run("Operation traces no phone values", OperationTracesNoPhoneValues);
            Run("Unexpected failures propagate", UnexpectedFailuresPropagate);

            if (Failures.Count == 0)
            {
                Console.WriteLine("All 26 canonical phone number tests passed.");
                return 0;
            }

            foreach (string failure in Failures)
            {
                Console.Error.WriteLine(failure);
            }

            return 1;
        }

        private static void CountryMetadataIntegrity()
        {
            CountryPhoneMetadata[] all = CountryPhoneMetadata.All.ToArray();
            Equal(all.Length, all.Select(country => country.IsoAlpha3).Distinct().Count());
            True(all.Length >= 35);
            True(all.All(country => country.IsoAlpha3.Length == 3));
            True(all.All(country => country.IsoAlpha3.All(char.IsUpper)));
            True(all.All(country => IsAsciiDigits(country.CallingCode)));
            True(all.All(country => country.CallingCode.Length >= 1 && country.CallingCode.Length <= 3));
            True(all.All(country => country.NationalNumberLengths.Count > 0));
            True(all.All(country => country.NationalNumberLengths.All(
                length => length > 0 && length + country.CallingCode.Length <= 15)));
            Equal("358", GetCountry("FIN").CallingCode);
            Equal("1", GetCountry("USA").CallingCode);
            Equal("1", GetCountry("CAN").CallingCode);
            Equal("420", GetCountry("CZE").CallingCode);
        }

        private static void NationalFinnishNumber()
        {
            Success("0401234567", " fin ", "+358401234567");
        }

        private static void FormattedFinnishNumber()
        {
            Success("(040) 123-4567", "FIN", "+358401234567");
        }

        private static void NationalHungarianNumber()
        {
            Success("06 30 123 4567", "HUN", "+36301234567");
        }

        private static void NationalUsNumber()
        {
            Success("(202) 555-0123", "USA", "+12025550123");
        }

        private static void InternationalCountryReplacement()
        {
            Success("+44 20 7946 0958", "FIN", "+3582079460958");
        }

        private static void DoubleZeroCountryReplacement()
        {
            Success("0044 20 7946 0958", "FIN", "+3582079460958");
        }

        private static void ParenthesizedSourceTrunkPrefix()
        {
            Success("+358 (0) 40 123 4567", "FIN", "+358401234567");
        }

        private static void ItalianSignificantZero()
        {
            Success("+39 (0) 2 1234 5678", "ITA", "+390212345678");
        }

        private static void VariableLengthCallingCode()
        {
            Success("+420 202 555 0123", "USA", "+12025550123");
        }

        private static void MissingPhoneNumber()
        {
            Failure(null, "FIN", "MissingPhoneNumber");
        }

        private static void MissingCountryCode()
        {
            Failure("0401234567", " ", "MissingCountryCode");
        }

        private static void MalformedCountryCode()
        {
            Failure("0401234567", "FI", "MalformedCountryCode");
        }

        private static void UnsupportedCountryCode()
        {
            Failure("0401234567", "ZZZ", "UnsupportedCountryCode");
        }

        private static void UnsupportedCallingCode()
        {
            Failure("+999123456789", "FIN", "UnsupportedCallingCode");
        }

        private static void UnsupportedCharacters()
        {
            Failure("040.123.4567", "FIN", "InvalidPhoneNumberFormat");
        }

        private static void MisplacedPlus()
        {
            Failure("040+1234567", "FIN", "InvalidPhoneNumberFormat");
        }

        private static void UnbalancedParentheses()
        {
            Failure("(040 1234567", "FIN", "InvalidPhoneNumberFormat");
        }

        private static void EmptyParentheses()
        {
            Failure("040()1234567", "FIN", "InvalidPhoneNumberFormat");
        }

        private static void InvalidTargetLength()
        {
            Failure("+44 1234", "USA", "InvalidPhoneNumberLength");
        }

        private static void ShortCodeRejected()
        {
            Failure("123", "FIN", "InvalidPhoneNumberLength");
        }

        private static void EmergencyNumberRejected()
        {
            Failure("112", "FIN", "InvalidPhoneNumberLength");
        }

        private static void ExtensionRejected()
        {
            Failure("0401234567 ext 12", "FIN", "InvalidPhoneNumberFormat");
        }

        private static void OperationWritesOutputs()
        {
            ParameterCollection input = new ParameterCollection
            {
                { CanonicalPhoneNumberPlugin.ExistingPhoneNumberParameter, "0401234567" },
                { CanonicalPhoneNumberPlugin.CountryCodeParameter, "FIN" }
            };
            ParameterCollection output = new ParameterCollection();

            new CanonicalPhoneNumberOperation().Execute(input, output, new TraceCollector());

            Equal(true, output[CanonicalPhoneNumberPlugin.SuccessProperty]);
            Equal("+358401234567", output[CanonicalPhoneNumberPlugin.ResponseProperty]);
        }

        private static void OperationTracesNoPhoneValues()
        {
            TraceCollector tracing = new TraceCollector();
            ParameterCollection input = new ParameterCollection
            {
                { CanonicalPhoneNumberPlugin.ExistingPhoneNumberParameter, "0401234567" },
                { CanonicalPhoneNumberPlugin.CountryCodeParameter, "FIN" }
            };

            new CanonicalPhoneNumberOperation().Execute(
                input,
                new ParameterCollection(),
                tracing);

            string trace = string.Join(Environment.NewLine, tracing.Messages);
            False(trace.Contains("0401234567"));
            False(trace.Contains("+358401234567"));
            True(trace.Contains("FIN"));
            True(trace.Contains("Succeeded"));
        }

        private static void UnexpectedFailuresPropagate()
        {
            CanonicalPhoneNumberOperation operation =
                new CanonicalPhoneNumberOperation(new ThrowingService());

            Throws<InvalidOperationException>(() => operation.Execute(
                new ParameterCollection(),
                new ParameterCollection(),
                new TraceCollector()));
        }

        private static void Success(string phoneNumber, string countryCode, string expected)
        {
            CanonicalPhoneNumberResult result =
                new CanonicalPhoneNumberService().Canonicalize(phoneNumber, countryCode);
            True(result.Success);
            Equal(expected, result.Response);
            Equal("Succeeded", result.Outcome);
        }

        private static void Failure(string phoneNumber, string countryCode, string outcome)
        {
            CanonicalPhoneNumberResult result =
                new CanonicalPhoneNumberService().Canonicalize(phoneNumber, countryCode);
            False(result.Success);
            Equal(outcome, result.Outcome);
            True(!string.IsNullOrWhiteSpace(result.Response));
        }

        private static CountryPhoneMetadata GetCountry(string code)
        {
            True(CountryPhoneMetadata.TryGet(code, out CountryPhoneMetadata country));
            return country;
        }

        private static bool IsAsciiDigits(string value)
        {
            return value.All(character => character >= '0' && character <= '9');
        }

        private static void Run(string name, Action test)
        {
            try
            {
                test();
                Console.WriteLine("PASS: " + name);
            }
            catch (Exception exception)
            {
                Failures.Add($"FAIL: {name}: {exception.Message}");
            }
        }

        private static void True(bool condition)
        {
            if (!condition)
            {
                throw new InvalidOperationException("Expected true.");
            }
        }

        private static void False(bool condition)
        {
            if (condition)
            {
                throw new InvalidOperationException("Expected false.");
            }
        }

        private static void Equal(object expected, object actual)
        {
            if (!object.Equals(expected, actual))
            {
                throw new InvalidOperationException(
                    $"Expected '{expected}', but received '{actual}'.");
            }
        }

        private static void Throws<TException>(Action action)
            where TException : Exception
        {
            try
            {
                action();
            }
            catch (TException)
            {
                return;
            }

            throw new InvalidOperationException(
                $"Expected exception '{typeof(TException).Name}'.");
        }

        private sealed class TraceCollector : ITracingService
        {
            public IList<string> Messages { get; } = new List<string>();

            public void Trace(string format, params object[] args)
            {
                Messages.Add(string.Format(format, args));
            }
        }

        private sealed class ThrowingService : ICanonicalPhoneNumberService
        {
            public CanonicalPhoneNumberResult Canonicalize(
                string existingPhoneNumber,
                string countryCode)
            {
                throw new InvalidOperationException("Unexpected test failure.");
            }
        }
    }
}
