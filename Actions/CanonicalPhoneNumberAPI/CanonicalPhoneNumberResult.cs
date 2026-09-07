namespace Fellowmind
{
    public sealed class CanonicalPhoneNumberResult
    {
        private CanonicalPhoneNumberResult(bool success, string response, string outcome)
        {
            Success = success;
            Response = response;
            Outcome = outcome;
        }

        public bool Success { get; }

        public string Response { get; }

        public string Outcome { get; }

        public static CanonicalPhoneNumberResult Succeeded(string canonicalPhoneNumber)
        {
            return new CanonicalPhoneNumberResult(true, canonicalPhoneNumber, "Succeeded");
        }

        public static CanonicalPhoneNumberResult Failed(string response, string outcome)
        {
            return new CanonicalPhoneNumberResult(false, response, outcome);
        }
    }
}
