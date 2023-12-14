using System.Text.RegularExpressions;

namespace GenerateReferenceNumber.Extensions
{
    public static class StringExtensions
    {
        public static bool IsNumeric(this string input)
        {
            return Regex.IsMatch(input, "^[0-9]+$");
        }
    }
}
