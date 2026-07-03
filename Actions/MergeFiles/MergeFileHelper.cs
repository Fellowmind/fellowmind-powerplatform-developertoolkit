using Microsoft.Xrm.Sdk;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;
using System;
using System.IO;

namespace MergeFileHelper
{
    public class MergeFileHelper : IPlugin
    {
        private const char FileSeparator = '|';
        private const string FileBase64StringParameter = "mergefilehelper_FileBase64String";
        private const string FileTypeParameter = "mergefilehelper_FileType";
        private const string MergedFileBase64Parameter = "mergefilehelper_MergedFileBase64";
        private const string PdfFileType = "pdf";

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new InvalidPluginExecutionException(nameof(serviceProvider));
            }

            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            tracingService.Trace("Starting file merge plugin...");

            string fileType = GetRequiredStringInput(context, FileTypeParameter);
            if (!string.Equals(fileType, PdfFileType, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidPluginExecutionException($"File type '{fileType}' is not supported. Only '{PdfFileType}' is currently supported.");
            }

            string joinedBase64String = GetRequiredStringInput(context, FileBase64StringParameter);
            string[] base64Files = SplitFilePayloads(joinedBase64String);

            try
            {
                context.OutputParameters[MergedFileBase64Parameter] = MergePdfFiles(base64Files, tracingService);
            }
            catch (FormatException ex)
            {
                tracingService.Trace($"Invalid Base64 file content: {ex.Message}");
                throw new InvalidPluginExecutionException("One or more files are not valid Base64 strings.", ex);
            }
            catch (PdfReaderException ex)
            {
                tracingService.Trace($"Invalid PDF file content: {ex.Message}");
                throw new InvalidPluginExecutionException("One or more files are not valid PDF documents.", ex);
            }

            tracingService.Trace("File merge completed successfully.");
        }

        private static string GetRequiredStringInput(IPluginExecutionContext context, string parameterName)
        {
            if (context == null || !context.InputParameters.Contains(parameterName) || !(context.InputParameters[parameterName] is string value) || string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidPluginExecutionException($"'{parameterName}' is missing or empty.");
            }

            return value;
        }

        private static string[] SplitFilePayloads(string joinedBase64String)
        {
            string[] base64Files = joinedBase64String.Split(new[] { FileSeparator }, StringSplitOptions.None);

            if (base64Files.Length == 0)
            {
                throw new InvalidPluginExecutionException("The file string was empty or incorrectly formatted.");
            }

            foreach (string base64File in base64Files)
            {
                if (string.IsNullOrWhiteSpace(base64File))
                {
                    throw new InvalidPluginExecutionException("The file string contains an empty file payload.");
                }
            }

            return base64Files;
        }

        private static string MergePdfFiles(string[] base64Files, ITracingService tracingService)
        {
            using (var outputDocument = new PdfDocument())
            {
                foreach (string base64String in base64Files)
                {
                    byte[] fileBytes = Convert.FromBase64String(base64String);

                    using (var inputStream = new MemoryStream(fileBytes))
                    {
                        tracingService.Trace($"Opening PDF ({fileBytes.Length} bytes)...");

                        using (var inputDocument = PdfReader.Open(inputStream, PdfDocumentOpenMode.Import))
                        {
                            for (int i = 0; i < inputDocument.PageCount; i++)
                            {
                                outputDocument.AddPage(inputDocument.Pages[i]);
                            }
                        }
                    }
                }

                using (var outStream = new MemoryStream())
                {
                    outputDocument.Save(outStream, false);
                    return Convert.ToBase64String(outStream.ToArray());
                }
            }
        }
    }
}
