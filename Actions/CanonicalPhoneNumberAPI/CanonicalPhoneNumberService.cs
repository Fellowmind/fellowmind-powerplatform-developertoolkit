using System;
using System.Linq;
using System.Text;

namespace Fellowmind
{
    public interface ICanonicalPhoneNumberService
    {
        CanonicalPhoneNumberResult Canonicalize(string existingPhoneNumber, string countryCode);
    }

    public sealed class CanonicalPhoneNumberService : ICanonicalPhoneNumberService
    {
        public CanonicalPhoneNumberResult Canonicalize(
            string existingPhoneNumber,
            string countryCode)
        {
            if (string.IsNullOrWhiteSpace(existingPhoneNumber))
            {
                return CanonicalPhoneNumberResult.Failed(
                    "'ExistingPhoneNumber' is required.",
                    "MissingPhoneNumber");
            }

            if (string.IsNullOrWhiteSpace(countryCode))
            {
                return CanonicalPhoneNumberResult.Failed(
                    "'CountryCode' is required.",
                    "MissingCountryCode");
            }

            string normalizedCountryCode = countryCode.Trim().ToUpperInvariant();
            if (normalizedCountryCode.Length != 3
                || normalizedCountryCode.Any(character => character < 'A' || character > 'Z'))
            {
                return CanonicalPhoneNumberResult.Failed(
                    "'CountryCode' must be an ISO 3166-1 alpha-3 code.",
                    "MalformedCountryCode");
            }

            if (!CountryPhoneMetadata.TryGet(normalizedCountryCode, out CountryPhoneMetadata targetCountry))
            {
                return CanonicalPhoneNumberResult.Failed(
                    $"Country code '{normalizedCountryCode}' is not supported.",
                    "UnsupportedCountryCode");
            }

            SyntaxResult syntax = NormalizeSyntax(existingPhoneNumber);
            if (!syntax.Success)
            {
                return CanonicalPhoneNumberResult.Failed(syntax.Error, "InvalidPhoneNumberFormat");
            }

            string nationalNumber;
            if (syntax.IsInternational)
            {
                string sourceCallingCode = CountryPhoneMetadata.FindCallingCode(syntax.Digits);
                if (sourceCallingCode == null)
                {
                    return CanonicalPhoneNumberResult.Failed(
                        "The international calling code is not supported.",
                        "UnsupportedCallingCode");
                }

                nationalNumber = syntax.Digits.Substring(sourceCallingCode.Length);
                string parenthesizedTrunkPrefix = FindParenthesizedSourceTrunkPrefix(
                    existingPhoneNumber,
                    sourceCallingCode,
                    syntax.UsesDoubleZeroPrefix);
                if (parenthesizedTrunkPrefix != null
                    && nationalNumber.StartsWith(
                        parenthesizedTrunkPrefix,
                        StringComparison.Ordinal))
                {
                    nationalNumber = nationalNumber.Substring(parenthesizedTrunkPrefix.Length);
                }
            }
            else
            {
                nationalNumber = syntax.Digits;
                if (!string.IsNullOrEmpty(targetCountry.NationalTrunkPrefix)
                    && nationalNumber.StartsWith(
                        targetCountry.NationalTrunkPrefix,
                        StringComparison.Ordinal))
                {
                    nationalNumber = nationalNumber.Substring(
                        targetCountry.NationalTrunkPrefix.Length);
                }
            }

            if (!targetCountry.NationalNumberLengths.Contains(nationalNumber.Length)
                || targetCountry.CallingCode.Length + nationalNumber.Length > 15)
            {
                return CanonicalPhoneNumberResult.Failed(
                    $"The phone number length is invalid for country '{normalizedCountryCode}'.",
                    "InvalidPhoneNumberLength");
            }

            return CanonicalPhoneNumberResult.Succeeded(
                "+" + targetCountry.CallingCode + nationalNumber);
        }

        private static SyntaxResult NormalizeSyntax(string existingPhoneNumber)
        {
            string value = existingPhoneNumber.Trim();
            bool usesPlusPrefix = value.StartsWith("+", StringComparison.Ordinal);
            bool usesDoubleZeroPrefix = !usesPlusPrefix
                && value.StartsWith("00", StringComparison.Ordinal);
            int parenthesisDepth = 0;
            bool parenthesisContainsDigit = false;
            StringBuilder digits = new StringBuilder(value.Length);

            for (int index = 0; index < value.Length; index++)
            {
                char character = value[index];
                if (character >= '0' && character <= '9')
                {
                    digits.Append(character);
                    if (parenthesisDepth == 1)
                    {
                        parenthesisContainsDigit = true;
                    }

                    continue;
                }

                if (character == '+')
                {
                    if (index != 0 || !usesPlusPrefix)
                    {
                        return SyntaxResult.Failed(
                            "The phone number contains a misplaced '+' character.");
                    }

                    continue;
                }

                if (character == ' ' || character == '-')
                {
                    continue;
                }

                if (character == '(')
                {
                    if (parenthesisDepth != 0)
                    {
                        return SyntaxResult.Failed(
                            "The phone number contains nested parentheses.");
                    }

                    parenthesisDepth = 1;
                    parenthesisContainsDigit = false;
                    continue;
                }

                if (character == ')')
                {
                    if (parenthesisDepth != 1)
                    {
                        return SyntaxResult.Failed(
                            "The phone number contains unbalanced parentheses.");
                    }

                    if (!parenthesisContainsDigit)
                    {
                        return SyntaxResult.Failed(
                            "The phone number contains empty parentheses.");
                    }

                    parenthesisDepth = 0;
                    continue;
                }

                return SyntaxResult.Failed(
                    "The phone number contains unsupported characters.");
            }

            if (parenthesisDepth != 0)
            {
                return SyntaxResult.Failed(
                    "The phone number contains unbalanced parentheses.");
            }

            string normalizedDigits = digits.ToString();
            if (usesDoubleZeroPrefix)
            {
                normalizedDigits = normalizedDigits.Substring(2);
            }

            if (normalizedDigits.Length == 0)
            {
                return SyntaxResult.Failed("The phone number does not contain any digits.");
            }

            return SyntaxResult.Succeeded(
                normalizedDigits,
                usesPlusPrefix || usesDoubleZeroPrefix,
                usesDoubleZeroPrefix);
        }

        private static string FindParenthesizedSourceTrunkPrefix(
            string existingPhoneNumber,
            string sourceCallingCode,
            bool usesDoubleZeroPrefix)
        {
            StringBuilder compact = new StringBuilder(existingPhoneNumber.Length);
            foreach (char character in existingPhoneNumber.Trim())
            {
                if (character != ' ' && character != '-')
                {
                    compact.Append(character);
                }
            }

            string compactNumber = compact.ToString();
            string internationalPrefix =
                (usesDoubleZeroPrefix ? "00" : "+") + sourceCallingCode;
            return CountryPhoneMetadata.GetNationalTrunkPrefixes(sourceCallingCode)
                .FirstOrDefault(trunkPrefix => compactNumber.StartsWith(
                    internationalPrefix + "(" + trunkPrefix + ")",
                    StringComparison.Ordinal));
        }

        private sealed class SyntaxResult
        {
            private SyntaxResult(
                bool success,
                string digits,
                bool isInternational,
                bool usesDoubleZeroPrefix,
                string error)
            {
                Success = success;
                Digits = digits;
                IsInternational = isInternational;
                UsesDoubleZeroPrefix = usesDoubleZeroPrefix;
                Error = error;
            }

            public bool Success { get; }

            public string Digits { get; }

            public bool IsInternational { get; }

            public bool UsesDoubleZeroPrefix { get; }

            public string Error { get; }

            public static SyntaxResult Succeeded(
                string digits,
                bool isInternational,
                bool usesDoubleZeroPrefix)
            {
                return new SyntaxResult(
                    true,
                    digits,
                    isInternational,
                    usesDoubleZeroPrefix,
                    null);
            }

            public static SyntaxResult Failed(string error)
            {
                return new SyntaxResult(false, null, false, false, error);
            }
        }
    }
}
