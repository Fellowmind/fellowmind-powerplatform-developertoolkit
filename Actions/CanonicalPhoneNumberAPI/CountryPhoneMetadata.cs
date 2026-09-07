using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Fellowmind
{
    public sealed class CountryPhoneMetadata
    {
        private static readonly IReadOnlyDictionary<string, CountryPhoneMetadata> Countries =
            new ReadOnlyDictionary<string, CountryPhoneMetadata>(
                CreateCountries().ToDictionary(country => country.IsoAlpha3, StringComparer.Ordinal));

        private static readonly string[] CallingCodes = Countries.Values
            .Select(country => country.CallingCode)
            .Distinct(StringComparer.Ordinal)
            .OrderByDescending(code => code.Length)
            .ThenBy(code => code, StringComparer.Ordinal)
            .ToArray();

        private CountryPhoneMetadata(
            string isoAlpha3,
            string callingCode,
            string nationalTrunkPrefix,
            params int[] nationalNumberLengths)
        {
            IsoAlpha3 = isoAlpha3;
            CallingCode = callingCode;
            NationalTrunkPrefix = nationalTrunkPrefix;
            NationalNumberLengths = Array.AsReadOnly(nationalNumberLengths);
        }

        public string IsoAlpha3 { get; }

        public string CallingCode { get; }

        public string NationalTrunkPrefix { get; }

        public IReadOnlyCollection<int> NationalNumberLengths { get; }

        public static IReadOnlyCollection<CountryPhoneMetadata> All => Countries.Values.ToArray();

        public static bool TryGet(string isoAlpha3, out CountryPhoneMetadata country)
        {
            country = null;
            return isoAlpha3 != null && Countries.TryGetValue(isoAlpha3, out country);
        }

        public static string FindCallingCode(string internationalDigits)
        {
            return CallingCodes.FirstOrDefault(
                code => internationalDigits.StartsWith(code, StringComparison.Ordinal));
        }

        public static IReadOnlyCollection<string> GetNationalTrunkPrefixes(string callingCode)
        {
            return Countries.Values
                .Where(country => country.CallingCode == callingCode)
                .Select(country => country.NationalTrunkPrefix)
                .Where(prefix => !string.IsNullOrEmpty(prefix))
                .Distinct(StringComparer.Ordinal)
                .OrderByDescending(prefix => prefix.Length)
                .ToArray();
        }

        private static IEnumerable<CountryPhoneMetadata> CreateCountries()
        {
            // ISO codes: https://www.iso.org/obp/ui/#search (retrieved 2026-08-31).
            // Calling codes: https://www.itu.int/oth/T0202.aspx?parent=T0202 (retrieved 2026-08-31).
            yield return Country("AUS", "61", "0", 9);
            yield return Country("AUT", "43", "0", 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
            yield return Country("BEL", "32", "0", 8, 9);
            yield return Country("BGR", "359", "0", 7, 8, 9);
            yield return Country("CAN", "1", "", 10);
            yield return Country("CHE", "41", "0", 9);
            yield return Country("CHN", "86", "0", 10, 11);
            yield return Country("CYP", "357", "", 8);
            yield return Country("CZE", "420", "", 9);
            yield return Country("DEU", "49", "0", 5, 6, 7, 8, 9, 10, 11);
            yield return Country("DNK", "45", "", 8);
            yield return Country("ESP", "34", "", 9);
            yield return Country("EST", "372", "", 7, 8, 9, 10);
            yield return Country("FIN", "358", "0", 5, 6, 7, 8, 9, 10, 11, 12);
            yield return Country("FRA", "33", "0", 9);
            yield return Country("GBR", "44", "0", 9, 10);
            yield return Country("GRC", "30", "", 10);
            yield return Country("HRV", "385", "0", 8, 9);
            yield return Country("HUN", "36", "06", 8, 9);
            yield return Country("IND", "91", "0", 10);
            yield return Country("IRL", "353", "0", 7, 8, 9, 10);
            yield return Country("ISL", "354", "", 7, 9);
            yield return Country("ITA", "39", "", 6, 7, 8, 9, 10, 11);
            yield return Country("JPN", "81", "0", 9, 10);
            yield return Country("LIE", "423", "", 7, 8, 9);
            yield return Country("LTU", "370", "0", 8);
            yield return Country("LUX", "352", "", 4, 5, 6, 7, 8, 9, 10, 11);
            yield return Country("LVA", "371", "", 8);
            yield return Country("MLT", "356", "", 8);
            yield return Country("NLD", "31", "0", 9);
            yield return Country("NOR", "47", "", 8);
            yield return Country("NZL", "64", "0", 8, 9, 10);
            yield return Country("POL", "48", "", 9);
            yield return Country("PRT", "351", "", 9);
            yield return Country("ROU", "40", "0", 9);
            yield return Country("SVK", "421", "0", 9);
            yield return Country("SVN", "386", "0", 8);
            yield return Country("SWE", "46", "0", 7, 8, 9, 10);
            yield return Country("USA", "1", "", 10);
        }

        private static CountryPhoneMetadata Country(
            string isoAlpha3,
            string callingCode,
            string nationalTrunkPrefix,
            params int[] nationalNumberLengths)
        {
            return new CountryPhoneMetadata(
                isoAlpha3,
                callingCode,
                nationalTrunkPrefix,
                nationalNumberLengths);
        }
    }
}
