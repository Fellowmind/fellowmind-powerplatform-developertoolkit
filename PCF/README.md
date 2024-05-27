# PCF
Run individual components on their folder:
npm start watch

Publish:
pac auth create
pac auth create --url https://fmfiproductdevelopment.crm4.dynamics.com/

Check active pac auth:
pac auth list
UNIVERSAL      demo@go365demo.onmicrosoft.com        Public User            FMFI Product Development      https://fmfiproductdevelopment.crm4.dynamics.com/

Update ControlManifest.Input.xml version

pac pcf push --publisher-prefix fmfi


**Environment:**
node v16.20.2