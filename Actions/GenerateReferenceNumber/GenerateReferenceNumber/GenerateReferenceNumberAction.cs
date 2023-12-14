using GenerateReferenceNumber.Extensions;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;
using System.Activities;

namespace GenerateReferenceNumberAction
{
    public class GenerateReferenceNumberAction : CodeActivity
    {
        [Input("InputString1"), RequiredArgument]
        public InArgument<string> InputString1 { get; set; }

        [Input("InputString2")]
        public InArgument<string> InputString2 { get; set; }

        [Input("InputString3")]
        public InArgument<string> InputString3 { get; set; }

        [Input("DoNotReturnCheckDigit")]
        public InArgument<bool> DoNotReturnCheckDigit { get; set; }

        [Input("UseInternationalFormat")]
        public InArgument<bool> UseInternationalFormat { get; set; }

        [Output("ReferenceNumber")]
        public OutArgument<string> ReferenceNumber { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            ReferenceNumber.Set(context, string.Empty);

            ITracingService tracingService = context.GetExtension<ITracingService>();

            // Multipliers for calculating the check digit
            var multipliers = new int[3] { 7, 3, 1 };

            try
            {
                tracingService.Trace("Starting the reference number generation");

                // The reference number will be generated from maximum of three input strings. Only the first one is a required parameter.
                var inputString1 = InputString1.Get(context);
                var inputString2 = InputString2.Get(context);
                var inputString3 = InputString3.Get(context);

                // Boolean value used to decide if the check digit should be returned or not (in Finland this is mandatory)
                var doNotReturnCheckDigit = DoNotReturnCheckDigit.Get(context);

                // Boolean value used to return the reference number in international (RF) format
                var useInternationalFormat = UseInternationalFormat.Get(context);

                // Combine the input strings
                var referenceNumber = inputString1 + inputString2 + inputString3;

                // Validate
                if (string.IsNullOrWhiteSpace(referenceNumber))
                {
                    throw new InvalidPluginExecutionException("Reference number is empty");
                }
                if (referenceNumber.Length > 19)
                {
                    throw new InvalidPluginExecutionException("The base number combined from input parameters exceed the limit of 19 characters");
                }
                if (!referenceNumber.IsNumeric())
                {
                    throw new InvalidPluginExecutionException("Parsing of the input parameters failed. Input parameters can't contain any alphabetical characters or spaces, but only numbers.");
                }

                // Calculate check digit and add to the reference number if it is requested
                if (!doNotReturnCheckDigit)
                {
                    // The input reference number needs to be reversed for counting of the check digit
                    string referenceNumberReversed = Reverse(referenceNumber);
                    var checkDigit = CalculateCheckDigit(referenceNumberReversed, multipliers);

                    // Add checkdigit as the final number of the referencenumber
                    referenceNumber += checkDigit.ToString();

                    // If the international (RF) format is requested, calculate checksum for it and add a prefix. Prerequisite for this is reference number with a check digit
                    if (useInternationalFormat)
                    {
                        var internationalCheckDigit = CalculateRfCheckDigit(referenceNumber);

                        referenceNumber = "RF" + internationalCheckDigit + referenceNumber;
                    }
                }

                ReferenceNumber.Set(context, referenceNumber);
            }
            catch (Exception e)
            {
                tracingService.Trace($"Exception in reference number generation. Message: {e.Message}");
                throw;
            }
        }

        private string CalculateRfCheckDigit(string referenceNumberWithCheckDigit)
        {
            var checkNumberForLetterR = "27";
            var checkNumberForLetterF = "15";
            var checkBaseNumber = "00";

            // Should combine: input + 27 + 15 + 00
            var combinedRfNumber = referenceNumberWithCheckDigit + checkNumberForLetterR + checkNumberForLetterF + checkBaseNumber;

            // Try to convert the string to a long integer
            if (long.TryParse(combinedRfNumber, out long number))
            {
                // Calculate the remainder when number is divided by 97
                int remainder = (int)(number % 97);

                // Subtract the remainder from 98
                var result = 98 - remainder;

                // If result is under 10, add a preceding zero (eg. "07")
                if (result < 10)
                {
                    return "0" + result.ToString();
                }

                return result.ToString();
            }
            else
            {
                throw new ArgumentException("Input string is not a valid long integer when trying to calculate RF check digit.");
            }
        }

        private int CalculateCheckDigit(string referenceNumberReversed, int[] multipliers)
        {
            var output = 0;
            var multiplierIndex = 0;
            var charArray = referenceNumberReversed.ToCharArray();

            for (int numberIndex = 0; numberIndex < charArray.Length; numberIndex++)
            {
                // We need to start looping through the multipliers again
                if (multiplierIndex == 3)
                {
                    multiplierIndex = 0;
                }

                var success = Int32.TryParse(charArray[numberIndex].ToString(), out int number);

                if (success)
                {
                    output += number * multipliers[multiplierIndex];
                    multiplierIndex++;
                }
                else
                {
                    throw new InvalidPluginExecutionException("Parsing of the input parameters failed. Input parameters can't contain any alphabetical characters or spaces, but only numbers.");
                }
            }

            // Round to the next full 10. And then subtract the calculated number from that rounded number
            output = RoundToNearestTenAndSubract(output);

            // The check digit cannot be 10 by the spec. 
            if (output == 10)
            {
                output = 0;
            }

            return output;
        }

        private int RoundToNearestTenAndSubract(int number)
        {
            var nearestTen = (int)(Math.Ceiling(number / 10.0d) * 10);

            return nearestTen - number;
        }

        private static string Reverse(string s)
        {
            var charArray = s.ToCharArray();
            Array.Reverse(charArray);
            return new string(charArray);
        }

        
    }
}