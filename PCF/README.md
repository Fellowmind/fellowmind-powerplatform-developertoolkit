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

PCF Components have DevOps-pipeline that is triggering from the master -branch and deploying latest version automatically to the development environment.
https://dev.azure.com/godemo/FM%20Product%20development%20ALM/_build?definitionId=49 
Enjoy!