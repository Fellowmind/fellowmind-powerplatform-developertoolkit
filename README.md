# Fellowmind Power Platform Developer Toolkit

The Fellowmind Power Platform Developer Toolkit is a collection of reusable tools for Microsoft Power Platform and Dynamics 365 development. It includes PCF controls, model-driven app JavaScript web resources, Dataverse custom actions/plugins, and a utility for generating JavaScript constants from Dataverse metadata.

The toolkit is intended to speed up common implementation work, improve user experience in model-driven apps, and provide reusable building blocks for customer projects.

![Toolkit Overview](https://github.com/user-attachments/assets/5f62e9e9-4c87-4745-b874-cb3f80ea7da2)

---

## What the Toolkit Includes

| Area | Path | Purpose |
| :--- | :--- | :--- |
| **PCF controls** | `PCF` | Reusable Power Apps Component Framework controls for model-driven app forms and fields. |
| **JavaScript web resources** | `Fellowmind.PowerPlatform.DeveloperToolkit.JS` | Shared JavaScript library, reusable JS components, localization resources, and showcase scripts for model-driven apps. |
| **Dataverse actions and plugins** | `Actions` | Custom workflow activities and plugins used from Dataverse, custom APIs, workflows, and Power Automate. |

---

## PCF Controls

The `PCF` folder contains independent PCF controls. Each control has its own project folder, package dependencies, manifest, and build scripts.

| Control | Purpose |
| :--- | :--- |
| `Checkbox` | Two-option checkbox control. |
| `ChoiceButtons` | Displays choice/option set values as selectable buttons. |
| `ChoiceSearchAndColor` | Choice/option set control with search and optional color support. |
| `CustomDatePicker` | Date picker with custom display modes, such as year/month and month/day. |
| `CustomLabel` | Configurable label/display control. |
| `EnhancedTextInput` | Enhanced text input with improved UX and character-related options. |
| `FormButton` | Button control that triggers form logic by changing a bound value. |
| `Hierarchy` | Hierarchy visualization/control for related records. |
| `Iban_Validator` | Finnish IBAN validation control. |
| `ManyToManyLookup` | Tag-style lookup control for managing many-to-many relationships on forms. See `PCF\ManyToManyLookup\README.md`. |
| `ModernFormButton` | Modern configurable action button for model-driven app forms. See `PCF\ModernFormButton\README.md`. |
| `OpenHierarchyButton` | Button for opening hierarchy-related functionality. |
| `RegexValidator` | Text field validation with configurable regular expressions. |
| `Slider` | Slider input control. |
| `SSNValidator` | Finnish social security number validation control. |
| `StarRating` | Star rating input/display control. |
| `Year-picker` | Year picker control for selecting a year value. |

> 💡 For general PCF development and deployment notes, see `PCF\README.md`.

---

## JavaScript Web Resources

The JavaScript toolkit provides shared client-side helpers and reusable components for model-driven apps.

| Area | Path | Purpose |
| :--- | :--- | :--- |
| **Shared library** | `Fellowmind.PowerPlatform.DeveloperToolkit.JS\Fellowmind.PowerPlatform.DeveloperToolkit.JS\source` | Core `fmfi.PowerPlatform.DeveloperToolkit.JsLib` helpers for form scripting, Web API usage, dialogs, navigation, custom pages, listeners, and other model-driven app tasks. |
| **JS components** | `Fellowmind.PowerPlatform.DeveloperToolkit.JS\Fellowmind.PowerPlatform.DeveloperToolkit.JS\components` | Reusable higher-level form/grid components, including flow execution helpers and row copy helpers. |
| **Localization resources** | `Fellowmind.PowerPlatform.DeveloperToolkit.JS\Fellowmind.PowerPlatform.DeveloperToolkit.JS\components\strings` | Component localization resources for supported languages. |
| **Showcases** | `Fellowmind.PowerPlatform.DeveloperToolkit.JS\Fellowmind.PowerPlatform.DeveloperToolkit.JS\showcases` | Example form scripts that show how to use the JavaScript toolkit. |

The JS library is built around the global `fmfi.PowerPlatform.DeveloperToolkit` namespace and the model-driven app `Xrm` client API.

---

## Dataverse Actions and Plugins

The `Actions` folder contains reusable server-side Dataverse functionality.

| Component | Type | Purpose |
| :--- | :--- | :--- |
| `ExecuteHttpTrigger` | Custom workflow activity | Reads a Power Automate HTTP trigger URL from configuration or environment variables, posts a JSON body to it, and returns the response. |
| `FetchXMLHelperAPI` | Plugin/custom API helper | Executes FetchXML and returns the result as JSON. |
| `GenerateReferenceNumber` | Custom workflow activity | Generates Finnish reference numbers, with optional check digit and international RF format support. |
| `MergeFiles` | Plugin/custom API helper | Merges Base64 encoded PDF files and returns the merged PDF as Base64. See `Actions\MergeFiles\README.md`. |

The actions/plugins are classic .NET Framework projects and are included in `Actions\fellowmind.developertoolkit.plugins.sln`.

---

## Publisher and Namespace Conventions

* PCF controls use the `Fellowmind` namespace.
* The expected Power Platform publisher prefix is typically `fmfi`.
* JavaScript web resources use the `fmfi.PowerPlatform.DeveloperToolkit` namespace.
* Dataverse action/plugin parameter names are part of their public contract and should be preserved when updating components.

---

## Project Authors

* **Tomas Lepistö** - Power Platform Architect
* **Turo Juutilainen** - Power Platform Architect
* **Simo Auvinen** - D365 CE Consultant
* **Tuomas Malme** - D365 CE Competence Lead
