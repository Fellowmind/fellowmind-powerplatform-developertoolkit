using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.Xml;
using System.IO;

namespace Fellowmind.PowerPlatform.DeveloperToolkit.JS.ConstantGenerator
{
    /// <summary>
    /// Settings for the application
    /// </summary>
    public class Settings
    {
        /// <summary>
        /// Prefix for the file to be generated.
        /// </summary>
        public string FilePrefix { get; set; }

        /// <summary>
        /// Namespace for the constants.
        /// </summary>
        public string ConstantNamespace { get; set; }

        /// <summary>
        /// Location where the file will be created.
        /// </summary>
        public string FileLocation { get; set; }

        /// <summary>
        /// Tables that were selected for the generation.
        /// </summary>
        public string[] SelectedTables { get; set; }

        /// <summary>
        /// Indicates if all tables were selected.
        /// </summary>
        public bool SelectAll { get; set; }

        /// <summary>
        /// Indicates if user wishes to save all the settings used
        /// </summary>
        public bool RememberSettings { get; set; }

        /// <summary>
        /// Path of the settings XML file.
        /// </summary>
        public string XMLPath { get { return $"{Directory.GetCurrentDirectory()}\\settings.xml"; } }

        /// <summary>
        /// Serializes the content of the settings XML file.
        /// </summary>
        /// <returns>Serialized instance of the class with data from the settings XML file.</returns>
        public Settings Load()
        {            
            if (File.Exists(XMLPath))
            {
                XmlSerializer ser = new XmlSerializer(typeof(Settings));
                
                using (XmlReader reader = XmlReader.Create(XMLPath))
                {
                    return (Settings)ser.Deserialize(reader);                    
                }
            }
            else
            {
                return new Settings();
            }
        }

        /// <summary>
        /// Saves settings into XML file.
        /// </summary>
        public void Save()
        {
            var xml = new XmlSerializer(this.GetType());

            using (var xmlWriter = new StreamWriter(XMLPath))
            {
                xml.Serialize(xmlWriter, this);
            }
        }

    }
}
