/* eslint-disable no-irregular-whitespace */
import axios from "axios";

axios.defaults.baseURL = `${window.origin}/api/data/v9.2`;

if (window.location.href.includes("localhost")) {
  axios.defaults.headers.common["Authorization"] = "";
  axios.defaults.baseURL =
    "https://ENVIRONMENTNAME.crm4.dynamics.com/api/data/v9.2";
}

export const testGet = async () => {
  return await axios.get("accounts?$top=2");
};

export const fetchEntities = async (query: string, entityPlural: string) => {
  const fetchXml = query;

  // Prefer: odata.include-annotations="OData.Community.Display.V1.FormattedValue"

  const resp = await axios.get(
    `/${entityPlural}?fetchXml=${encodeURIComponent(fetchXml)}`,
    {
      headers: {
        Prefer:
          'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
      },
    }
  );

  return resp;
};

export const fetchParentEntity = async () => {
  const fetchXml = `
    <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
    <entity name="account">
      <attribute name="name" />
      <attribute name="telephone1" />
      <attribute name="emailaddress1" />
      <attribute name="accountid" />
      <filter type="and">
        <condition attribute="accountid" operator="eq" value="{e13ca800-8171-e911-a81d-000d3a3a6ca3}" />
      </filter>
    </entity>
  </fetch>
  `;

  const resp = await axios.get(
    `/accounts?fetchXml=${encodeURIComponent(fetchXml)}`
  );

  return resp;
};

// These will be 100% dynamic later
export const fetchEntities2 = async () => {
  const fetchXml = `
<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
  <entity name="opportunity">
    <attribute name="name" />
    <attribute name="customerid" />
    <attribute name="estimatedvalue" />
    <attribute name="statuscode" />
    <attribute name="opportunityid" />
    <attribute name="parentcontactid" />
    <attribute name="estimatedvalue" />
    <order attribute="name" descending="false" />
    <filter type="and">
      <condition attribute="parentcontactid" operator="in">
        <value uiname="Susanna Stubberod (sample)" uitype="contact">{9421A006-8171-E911-A81D-000D3A3A6CA3}</value>
        <value uiname="Robert Lyon (sample)" uitype="contact">{9E21A006-8171-E911-A81D-000D3A3A6CA3}</value>
      </condition>
    </filter>
    <link-entity name="contact" from="contactid" to="parentcontactid" visible="false" link-type="outer" alias="a_561fe8b4296ee911a81b000d3a3a67ef">
      <attribute name="fullname" />
    </link-entity>
  </entity>
</fetch>
  `;

  const resp = await axios.get(
    `/opportunities?fetchXml=${encodeURIComponent(fetchXml)}`
  );

  return resp;
};

export const fetchConfig = async (name: string) => {
  const resp = await axios.get(
    `/fmfi_developerkitconfigurations?$filter=fmfi_name eq '${name}'&$select=fmfi_name,fmfi_scriptvalue`
  );
  return resp;
};
