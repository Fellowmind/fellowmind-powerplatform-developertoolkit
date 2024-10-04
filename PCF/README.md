# PCF

**Environment:**
node v16.20.2

## Development
Run individual components on their folder:
`npm start watch`

## Publish
It is important to have the correct publisher prefix in the ControlManifest.Input.xml file. The publisher prefix is the prefix of the publisher of the solution in the Power Platform environment. The publisher prefix is the first part of the solution publisher's unique name. For example, if the publisher's unique name is "contoso", the publisher prefix is "contoso". Use the prefix 'fmfi'.

More instructions on PCF deployment in the [Confluence](https://confluence.fellowmind.fi/display/DEV/PCF+Deployment)

Check active pac auth:
pac auth list
UNIVERSAL      demo@go365demo.onmicrosoft.com        Public User            FMFI Product Development      https://fmfiproductdevelopment.crm4.dynamics.com/

### Publish for development

```bash
pac auth create
pac auth create --url https://fmfiproductdevelopment.crm4.dynamics.com/
```

Update ControlManifest.Input.xml version

pac pcf push --publisher-prefix fmfi

### Publish for production
The directory PCFToolkit contains the solution for production. Make sure to update the version in the ControlManifest.Input.xml file for each component.

You can use dotnet to publish the solution.

```bash
dotnet build --configuration Release
```

This will output the solution in the bin/Release folder.

If you want to get both the managed (production release) and the the unmanaged (for development) solution, you can use the following command:

```bash
dotnet build --configuration Both
```

This will output the solution in the bin/Both folder.

### IMPORTANT
IMPORT ONLY UNMANAGED-solution to dev-environment. Otherwise components cannot be exported with the main FM Developer Kit -solution.