using System;
using System.IO;
using System.Data;
using System.Linq;
using System.Windows.Forms;
using eCraft.D365.Connection.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using System.Reflection;
using System.Web.Services.Description;
using System.Text.RegularExpressions;
using System.ComponentModel;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Fellowmind.PowerPlatform.DeveloperToolkit.JS.ConstantGenerator
{
    public partial class frmMain : Form
    {
        /// <summary>
        /// Client for executing requests towards the D365 environment.
        /// </summary>
        ServiceClient client = null;

        /// <summary>
        /// StreamWriter used to write constants into the desired path.
        /// </summary>
        StreamWriter writer = null;

        /// <summary>
        /// Runtime settings from the XML settings file.
        /// </summary>
        Settings runTimeSettings = null;

        bool formInitializing { get; set; }


        public frmMain()
        {
            InitializeComponent();
        }

        private void frmMain_Load(object sender, EventArgs e)
        {
            formInitializing = true;            
            LoadSettings();
            formInitializing = false;
        }

        /// <summary>
        /// Loads settings from the XML settings file.
        /// </summary>
        private void LoadSettings()
        {
            runTimeSettings = new Settings().Load();
            if (runTimeSettings.SelectedTables == null)
                runTimeSettings.SelectedTables = new string[0];
            
            txtPrefix.Text = runTimeSettings.FilePrefix;
            txtNamespace.Text = runTimeSettings.ConstantNamespace;
            txtFileLocation.Text = runTimeSettings.FileLocation;
            chkSelectAll.Checked = runTimeSettings.SelectAll;
            chkRemember.Checked = runTimeSettings.RememberSettings;
        }

        /// <summary>
        /// Loads selected entity tables based on the runtime settings.
        /// </summary>
        private void LoadSelections()
        {
            for (int i = 0; i < runTimeSettings.SelectedTables.Count(); i++)
            {
                var table = runTimeSettings.SelectedTables[i];
                var indexToSelect = chkListTables.Items.IndexOf(table);
                if(indexToSelect != -1)
                    chkListTables.SetItemChecked(indexToSelect, true);                
            }
        }

        /// <summary>
        /// Selects all tables from the checklist.
        /// </summary>
        /// <param name="selected">Indicates if all the tables should be selected.</param>
        private void SetTablesSelected(bool selected)
        {   
            for (int i = 0; i < chkListTables.Items.Count; i++)
            {
                chkListTables.SetItemChecked(i, selected);
            }

            runTimeSettings.SelectedTables = new string[chkListTables.CheckedItems.Count];

            for (int i = 0; i < chkListTables.CheckedItems.Count; i++)
            {
                runTimeSettings.SelectedTables[i] = chkListTables.CheckedItems[i].ToString();
            }           
        }

        private void txtConnectionstring_TextChanged(object sender, EventArgs e)
        {   
            if(runTimeSettings.RememberSettings)
                runTimeSettings.Save();
        }

        private void btnConnect_Click(object sender, EventArgs e)
        {
            try
            {
                if (txtConnectionstring.Text == string.Empty)
                {
                    Report("No connectionstring have been given!", Enums.LoggingLevel.WARNING);
                    return;
                }

                if (MessageBox.Show($"Connect to Dataverse using connectionstring '{txtConnectionstring.Text}'?", "Connect to Dataverse", MessageBoxButtons.YesNo) == DialogResult.Yes)
                {
                    Cursor.Current = Cursors.WaitCursor;

                    formInitializing = true;
                    client = new ServiceClient(txtConnectionstring.Text, 100, Report);                    
                    chkListTables.Items.Clear();
                    LoadTables();
                    LoadSelections();
                    formInitializing = false;
                    Report("Connection created successfully!", Enums.LoggingLevel.INFO);

                    Cursor.Current = Cursors.Default;
                }
            }
            catch (Exception ex)
            {
                formInitializing = false;
                Cursor.Current = Cursors.Default;
                Report(ex.Message, Enums.LoggingLevel.ERROR);
            }            
        }

        private bool Report(string message, Enums.LoggingLevel level)
        {

            switch (level)
            {
                case Enums.LoggingLevel.INFO:
                    MessageBox.Show(message, "Info", MessageBoxButtons.OK);
                    break;
                case Enums.LoggingLevel.WARNING:
                    MessageBox.Show(message, "Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    break;
                case Enums.LoggingLevel.ERROR:
                    MessageBox.Show(message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    break;
                case Enums.LoggingLevel.CRITICAL:
                    MessageBox.Show(message, "Critical", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    break;
                default:
                    break;
            }

            return true;
        }

        /// <summary>
        /// Load all entity tables to the check list.
        /// </summary>
        private void LoadTables()
        {
            var req = new RetrieveAllEntitiesRequest()
            {
                RetrieveAsIfPublished = true,
            };

            var res = (RetrieveAllEntitiesResponse)client.Service.Execute(req);

            foreach (var m in res.EntityMetadata.Where(m => m.DisplayName.UserLocalizedLabel != null).OrderBy(m => m.DisplayName.UserLocalizedLabel.Label))
            {
                chkListTables.Items.Add($"{m.DisplayName.UserLocalizedLabel.Label}: \"{m.LogicalName}\"", false);                
            }
        }         
        
        /// <summary>
        /// Retrieves desired entitys attribute metadata.
        /// </summary>
        /// <param name="entityLogicalName">Logical name of the entity which attribute metadata should be retrieved.</param>
        /// <returns>Array of entity attribute metadata.</returns>
        private AttributeMetadata[] GetEntityAttributes(string entityLogicalName)
        {
            var req = new RetrieveEntityRequest()
            {
                EntityFilters = EntityFilters.Attributes,
                LogicalName = entityLogicalName,
                RetrieveAsIfPublished = true,
            };

            return ((RetrieveEntityResponse)client.Service.Execute(req)).EntityMetadata.Attributes;           
        }

        /// <summary>
        /// Retrieves desired entitys optionset attribute metadata.
        /// </summary>
        /// <param name="entityLogicalName">Logical name of the entity which optionset attribute metadata should be retrieved.</param>
        /// <returns>Array of entity optionset attribute metadata.</returns>
        private AttributeMetadata[] GetEntityOptionSets(string entityLogicalName)
        {
            var req = new RetrieveEntityRequest()
            {
                EntityFilters = EntityFilters.Attributes,
                LogicalName = entityLogicalName,
                RetrieveAsIfPublished = true,
            };

            return ((RetrieveEntityResponse)client.Service.Execute(req)).EntityMetadata.Attributes.Where(m => m.AttributeType == AttributeTypeCode.Picklist).ToArray();
        }

        private OptionMetadata[] GetOptionSet(string entityLogicalName, AttributeMetadata attribute)
        {
            var req = new RetrieveAttributeRequest()
            {
                EntityLogicalName = entityLogicalName,
                LogicalName = attribute.LogicalName,
                RetrieveAsIfPublished = true,
            };

            var res = (RetrieveAttributeResponse)client.Service.Execute(req);
            PicklistAttributeMetadata meta = (PicklistAttributeMetadata)res.AttributeMetadata;
            return meta.OptionSet.Options.ToArray();
        }

        /// <summary>
        /// Executes the constant generation.
        /// </summary>
        /// <param name="isPreview">Indicates if the constants whould be written into the preview window.</param>
        private void ExecuteGeneration(bool isPreview)
        {
            try
            {
                if (chkListTables.CheckedItems.Count == 0)
                {
                    Report("No tables have been selected!", Enums.LoggingLevel.WARNING);
                    return;
                }

                if (txtPrefix.Text == string.Empty)
                {
                    Report("No file prefix have been given!", Enums.LoggingLevel.WARNING);
                    return;
                }

                if (txtNamespace.Text == string.Empty)
                {
                    Report("No namespace have been given!", Enums.LoggingLevel.WARNING);
                    return;
                }

                Cursor.Current = Cursors.WaitCursor;
                Generate(isPreview);
                Cursor.Current = Cursors.Default;

                if(!isPreview)
                    Report("File generated successfully!", Enums.LoggingLevel.INFO);
            }
            catch (Exception ex)
            {
                Cursor.Current = Cursors.Default;
                Report(ex.ToString(), Enums.LoggingLevel.ERROR);
            }
        }

        private void btnGenerate_Click(object sender, EventArgs e)
        {
            ExecuteGeneration(false);
        }

        /// <summary>
        /// Writes a new line.
        /// </summary>
        /// <param name="isPreview">Indicates if the line should be written into the preview window.</param>
        /// <param name="input">Line to write.</param>
        private void WriteLine(bool isPreview, string input)
        {
            if (isPreview)
            {
                if (txtPreview.Text != string.Empty)
                {
                    txtPreview.Text += Environment.NewLine + input;
                }
                else
                {
                    txtPreview.Text = input;
                }
            }
            else
            {
                if (writer == null)
                    writer = new StreamWriter(txtFileLocation.Text, false);

                writer.WriteLine(input);
            }
        }      
        
        private void WriteWarning(string input)
        {
            if (txtWarnings.Text != string.Empty)
            {
                txtWarnings.Text += Environment.NewLine + input;
            }
            else
            {
                txtWarnings.Text = input;
            }
        }

        /// <summary>
        /// Generates the constants either in the preview window or in a .js file.
        /// </summary>
        /// <param name="isPreview">Indicates if the constants should be generated only in the preview window.</param>
        private void Generate(bool isPreview)
        {            
            txtPreview.Text = String.Empty;
            txtWarnings.Text = string.Empty;
            var nSpace = txtNamespace.Text;           
            var arr = nSpace.Split('.');
            var fullnSpace = string.Empty;            

            WriteLine(isPreview, $"/// This file has been generated with Fellowmind.PowerPlatform.DeveloperToolkit.Js.ConstantGenerator {Assembly.GetExecutingAssembly().GetName().Version}.");
            WriteLine(isPreview, "/// Please do not modify the file manually. Instead, if new tables / attributes / optionsets are needed then use the tool to generate the constants.");
            WriteLine(isPreview, "");

            // Generate namespace information
            for (int i = 0; i < arr.Length; i++)
            {
                if(i == 0)
                {
                    WriteLine(isPreview, $"var {arr[i]} = {arr[i]} || " + "{};");
                    fullnSpace = arr[i];
                }
                else if(i < arr.Length - 1)
                {
                    WriteLine(isPreview, $"{fullnSpace}.{arr[i]} = {fullnSpace}.{arr[i]} || " + "{};");
                    fullnSpace += "." + arr[i];                }
                else
                {
                    WriteLine(isPreview, $"{fullnSpace}.{arr[i]} = {fullnSpace}.{arr[i]} || " + "function () {");
                    WriteLine(isPreview, Indent(3) + "return {");
                    WriteLine(isPreview, Indent(6) + "Tables: {");
                }                
            }

            // Generate table information
            foreach (var table in chkListTables.CheckedItems)
            {
                // Generate table constants
                var logicalName = table.ToString().Split(':')[1].Replace("\"", "").Trim();
                var displayName = RemoveNonAlphaNumericChars(table.ToString().Split(':')[0]);
                WriteLine(isPreview, Indent(9) + RemoveNonAlphaNumericChars(displayName) + ": '" + logicalName + "',");
            }

            // Generate ending bracket for the table information
            WriteLine(isPreview, Indent(9) + "},");

            // Generate starting bracket for the attributes information
            WriteLine(isPreview, Indent(6) + "Attributes: {");

            // Generate table attribute information
            foreach (var table in chkListTables.CheckedItems)
            {
                var logicalName = table.ToString().Split(':')[1].Replace("\"", "");
                var displayName = RemoveNonAlphaNumericChars(table.ToString().Split(':')[0]);
                var attr = GetEntityAttributes(logicalName.Trim());

                // Generate starting bracket for the table attributes
                WriteLine(isPreview, Indent(9) + displayName + ": {");

                // Generate table attribute information (attributes that contain a user localized label and the attribute is not deprecated
                foreach (var a in attr.Where(m => m.DisplayName.UserLocalizedLabel != null && !m.DisplayName.UserLocalizedLabel.Label.ToUpper().Contains("DEPRECATED")).OrderBy(m => m.DisplayName.UserLocalizedLabel.Label))
                {
                    // Generate table attribute and remove malicious characters from the display name
                    var lbl = RemoveNonAlphaNumericChars(a.DisplayName.UserLocalizedLabel.Label);                     
                    WriteLine(isPreview, $"{Indent(12)} {lbl}: \"{a.LogicalName}\",");
                }

                // Generate ending bracket for the table attributes
                WriteLine(isPreview, Indent(9) + "},");
            }

            // Generate ending bracket for the attribute information       
            WriteLine(isPreview, Indent(6) + "},");

            // Generate starting bracket for the optionset information
            WriteLine(isPreview, Indent(6) + "OptionSets: {");

            // Generate table optionset information
            foreach (var table in chkListTables.CheckedItems)
            {
                var logicalName = table.ToString().Split(':')[1].Replace("\"", "");
                var displayName = RemoveNonAlphaNumericChars(table.ToString().Split(':')[0]);
                var attr = GetEntityOptionSets(logicalName.Trim());

                // Generate starting bracket for the table optionsets
                WriteLine(isPreview, Indent(9) + displayName + ": {");

                // Generate table optionset information (optionsets that contain a user localized label and the optionset is not deprecated
                foreach (var a in attr.Where(m => m.DisplayName.UserLocalizedLabel != null && !m.DisplayName.UserLocalizedLabel.Label.ToUpper().Contains("DEPRECATED")).OrderBy(m => m.DisplayName.UserLocalizedLabel.Label))
                {
                    // Generate table optionset label and remove malicious characters from the display name
                    var lbl = RemoveNonAlphaNumericChars(a.DisplayName.UserLocalizedLabel.Label);                  

                    // Generate starting bracked for the optionset
                    WriteLine(isPreview, Indent(12) + lbl + ": {");

                    var optionMeta = GetOptionSet(logicalName.Trim(), a);

                    foreach (var option in optionMeta)
                    {
                        // Generate optionset value label and remove malicious characters from the display name
                        var lblOption = RemoveNonAlphaNumericChars(option.Label.UserLocalizedLabel.Label);                       

                        WriteLine(isPreview, $"{Indent(15)} {lblOption}: {option.Value},");
                    }

                    // Generate ending bracket for the the optionset
                    WriteLine(isPreview, Indent(12) + "},");
                }

                // Generate ending bracket for the table optionset
                WriteLine(isPreview, Indent(9) + "},");
            }

            // Generate ending bracket for the optionset information       
            WriteLine(isPreview, Indent(6) + "},");

            // Generate ending bracket for the constants to be returned
            WriteLine(isPreview, Indent(3) + "};");

            // Generate ending bracket for the file
            WriteLine(isPreview, "}();");

            if (!isPreview)
            {
                writer.Flush();
                writer.Dispose();
                writer = null;
            }
        }

        /// <summary>
        /// Used for formatting the lines to be written with proper indent.
        /// </summary>
        /// <param name="count">Number of empty space to be added before the line so that indent is formatted properly.</param>
        /// <returns>String containing empty space.</returns>
        private string Indent(int count)
        {
            return "".PadLeft(count);
        }

        /// <summary>
        /// Removes any malicisious characters from the string value that cannot be used for the constants to be generated.
        /// Also replaces any leading numerals with equal word since a constant cannot begin with a number.
        /// </summary>
        /// <param name="value">Constant that should be checked.</param>
        /// <returns>Constant with only letters and numerals.</returns>
        private string RemoveNonAlphaNumericChars(string value) 
        {
            var original = value;
            value = Regex.Replace(value, "[^a-zA-Z0-9_.]+", "", RegexOptions.Compiled);

            if (char.IsDigit(value[0]))
            {
                switch (value[0])
                {
                    case '0':
                        value = $"Zero{value.Substring(1, value.Length-1)}";
                        break;

                    case '1':
                        value = $"One{value.Substring(1, value.Length - 1)}";
                        break;

                    case '2':
                        value = $"Two{value.Substring(1, value.Length - 1)}";
                        break;

                    case '3':
                        value = $"Three{value.Substring(1, value.Length - 1)}";
                        break;

                    case '4':
                        value = $"Four{value.Substring(1, value.Length - 1)}";
                        break;

                    case '5':
                        value = $"Five{value.Substring(1, value.Length - 1)}";
                        break;

                    case '6':
                        value = $"Six{value.Substring(1, value.Length - 1)}";
                        break;

                    case '7':
                        value = $"Seven{value.Substring(1, value.Length - 1)}";
                        break;

                    case '8':
                        value = $"Eight{value.Substring(1, value.Length - 1)}";
                        break;

                    case '9':
                        value = $"Nine{value.Substring(1, value.Length - 1)}";
                        break;
                    default:
                        break;
                }
            }

            if (!string.Equals(original, value))
                WriteWarning($"Un-usable characters detected in constant: original value '{original}' converted to '{value}'.");

            return value;      
        }

        private void chkSelectAll_CheckedChanged(object sender, EventArgs e)
        {
            if (formInitializing)
                return;

            Cursor.Current = Cursors.WaitCursor;
            SetTablesSelected(chkSelectAll.Checked);
            runTimeSettings.SelectAll = chkSelectAll.Checked;
            if (runTimeSettings.RememberSettings)
                runTimeSettings.Save();
            Cursor.Current = Cursors.Default;
        }

        private void btnFolderDialog_Click(object sender, EventArgs e)
        {
            if (txtPrefix.Text == string.Empty)
            {
                Report("File prefix is empty!", Enums.LoggingLevel.WARNING);
                return;
            }

            if (txtNamespace.Text == string.Empty)
            {
                Report("Constant namespace is empty!", Enums.LoggingLevel.WARNING);
                return;
            }

            folderDialog = new FolderBrowserDialog();
            var result = folderDialog.ShowDialog();

            if(result == DialogResult.OK)
            {
                txtFileLocation.Text = $"{folderDialog.SelectedPath}\\{txtPrefix.Text}.{txtNamespace.Text}.js";
                runTimeSettings.FileLocation = txtFileLocation.Text;
                if(runTimeSettings.RememberSettings)
                    runTimeSettings.Save();                
            }            
        }

        private void btnPreview_Click(object sender, EventArgs e)
        {
            ExecuteGeneration(true);            
        }

        private void chkRemember_CheckedChanged(object sender, EventArgs e)
        {
            if (formInitializing)
                return;

            var path = $"{Directory.GetCurrentDirectory()}\\settings.xml";

            if(!chkRemember.Checked) 
            {
                runTimeSettings = new Settings();
                runTimeSettings.Save();
            }
            else
            {                
                runTimeSettings.FilePrefix = txtPrefix.Text;
                runTimeSettings.ConstantNamespace = txtNamespace.Text;
                runTimeSettings.FileLocation = txtFileLocation.Text;
                runTimeSettings.SelectAll = chkSelectAll.Checked;
                runTimeSettings.SelectedTables = new string[chkListTables.CheckedItems.Count];        
                runTimeSettings.RememberSettings = chkRemember.Checked;

                for (int i = 0; i < chkListTables.CheckedItems.Count; i++)
                {
                    runTimeSettings.SelectedTables[i] = chkListTables.CheckedItems[i].ToString();
                }

                runTimeSettings.Save();
            }
        }

        private void txtPrefix_TextChanged(object sender, EventArgs e)
        {
            runTimeSettings.FilePrefix = txtPrefix.Text;

            if (txtPrefix.Text != string.Empty && txtNamespace.Text != string.Empty && txtFileLocation.Text != string.Empty)
            {
                txtFileLocation.Text = $"{new DirectoryInfo(Path.GetDirectoryName(txtFileLocation.Text)).Name}\\{txtPrefix.Text}.{txtNamespace.Text}.js";
            }                

            if (runTimeSettings.RememberSettings)
                runTimeSettings.Save();
        }

        private void txtNamespace_TextChanged(object sender, EventArgs e)
        {
            runTimeSettings.ConstantNamespace= txtNamespace.Text;

            if (txtPrefix.Text != string.Empty && txtNamespace.Text != string.Empty && txtFileLocation.Text != string.Empty)
            {
                txtFileLocation.Text = $"{new DirectoryInfo(Path.GetDirectoryName(txtFileLocation.Text)).Name}\\{txtPrefix.Text}.{txtNamespace.Text}.js";
            }

            if (runTimeSettings.RememberSettings)
                runTimeSettings.Save();
        }

        private void chkListTables_ItemCheck(object sender, ItemCheckEventArgs e)
        {
            if (formInitializing)
                return;

            runTimeSettings.SelectAll = false;
            var table = chkListTables.Items[e.Index].ToString();
            var arr = runTimeSettings.SelectedTables;
            
            if(e.NewValue == CheckState.Checked)
            {                
                if (!runTimeSettings.SelectedTables.Contains(table))
                {
                    Array.Resize(ref arr, runTimeSettings.SelectedTables.Length + 1);
                    runTimeSettings.SelectedTables = arr;
                    runTimeSettings.SelectedTables[runTimeSettings.SelectedTables.Length - 1] = table;
                }
            }
            else if(e.NewValue == CheckState.Unchecked) 
            {
                runTimeSettings.SelectedTables = runTimeSettings.SelectedTables.Where(s => !string.Equals(s.ToUpper(), table.ToString().ToUpper())).ToArray();
            }   
            
            if(runTimeSettings.RememberSettings)
                runTimeSettings.Save();
        }
    }
}
