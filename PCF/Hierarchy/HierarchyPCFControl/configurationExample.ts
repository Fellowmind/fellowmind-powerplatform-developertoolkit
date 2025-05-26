// export const configArr = [
//   {
//     idField: "accountid",
//     nameField: "name",
//     entityType: "account", // entityname
//     entityPlural: "accounts",
//     entityQuery: `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
//   <entity name="account">
//     <attribute name="name" />
//     <attribute name="telephone1" />
//     <attribute name="accountid" />
//     <attribute name="emailaddress1" />
//     <attribute name="parentaccountid" />
//     <attribute name="websiteurl" />
//     <attribute name="fax" />
//     <order attribute="name" descending="false" />
//     [FILTER]
//   </entity>
// </fetch>`,
//     parentEntity: "account", // null / entityname,
//     parentEntityField: "_parentaccountid_value", // null / field that connects to the parent entity
//     childEntity: "account", // null / entityname,
//     fields: [
//       {
//         attributeType: "text",
//         logicalName: "name",
//         displayName: "Name",
//       },
//       {
//         attributeType: "text",
//         logicalName: "websiteurl",
//         displayName: "Website",
//       },
//       {
//         attributeType: "text",
//         logicalName: "fax",
//         displayName: "Fax",
//       },
//       { attributeType: "text", logicalName: "name", displayName: "Name" },
//       {
//         attributeType: "text",
//         logicalName: "telephone1",
//         displayName: "Phone",
//       },
//       {
//         attributeType: "text",
//         logicalName: "emailaddress1",
//         displayName: "Email",
//       },
//     ], 
//     childQuery: `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
//   <entity name="account">
//     <attribute name="name" />
//     <attribute name="telephone1" />
//     <attribute name="accountid" />
//     <attribute name="emailaddress1" />
//     <order attribute="name" descending="false" />
//     [FILTER]
//   </entity>
// </fetch>`,
//   },
// ];

export const configArr = [
  {
    idField: "accountid",
    nameField: "name",
    entityType: "account",
    entityPlural: "accounts",
    entityQuery: `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
  <entity name="account">
    <attribute name="name" />
    <attribute name="telephone1" />
    <attribute name="accountid" />
    <attribute name="emailaddress1" />
    <order attribute="name" descending="false" />
    [FILTER]
  </entity>
</fetch>`,
    parentEntity: null,
    parentEntityField: null,
    childEntity: "contact",
    fields: [
      {
        attributeType: "text",
        logicalName: "name",
        displayName: "Name",
      },
      { attributeType: "text", logicalName: "name", displayName: "Name" },
      {
        attributeType: "text",
        logicalName: "telephone1",
        displayName: "Phone",
      },
      {
        attributeType: "text",
        logicalName: "emailaddress1",
        displayName: "Email",
      },
    ],
    childQuery: "",
  },
  {
    idField: "contactid",
    nameField: "fullname",
    entityType: "contact",
    entityPlural: "contacts",
    parentEntity: "account",
    parentEntityField: "_parentcustomerid_value",
    childEntity: null,
    fields: [
      { attributeType: "text", logicalName: "fullname", displayName: "Name" },
      {
        attributeType: "text",
        logicalName: "emailaddress1",
        displayName: "Email",
      },
      {
        attributeType: "lookup",
        logicalName: "businessunit",
        entityType: "businessunit",
        displayName: "Businessunit",
      },
    ],
    entityQuery: `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
    <entity name="contact">
      <attribute name="fullname" />
      <attribute name="telephone1" />
      <attribute name="contactid" />
      <attribute name="emailaddress1" />
            <attribute name="parentcustomerid" />
      <order attribute="fullname" descending="false" />
      [FILTER]

      <link-entity name="businessunit" from="businessunitid" to="owningbusinessunit" visible="false" link-type="outer" alias="businessunit">
        <attribute name="name" alias="businessunitName" />
        <attribute name="businessunitid" alias="businessunitId"/>
      </link-entity>
    </entity>
  </fetch>`,
    childQuery: "", 
  },
  {
    idField: "opportunityid",
    nameField: "name",
    entityType: "opportunity", 
    entityPlural: "opportunities",
    parentEntity: "contact", 
    parentEntityField: "_parentcontactid_value", 
    entityQuery: `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
  <entity name="opportunity">
    <attribute name="name" />
    <attribute name="customerid" />
    <attribute name="estimatedvalue" />
    <attribute name="statuscode" />
    <attribute name="opportunityid" />
    <attribute name="parentcontactid" />
    <attribute name="estimatedvalue" />
    <order attribute="name" descending="false" />
    [FILTER]
    <link-entity name="contact" from="contactid" to="parentcontactid" visible="false" link-type="outer" alias="a_561fe8b4296ee911a81b000d3a3a67ef">
      <attribute name="fullname" />
    </link-entity>
  </entity>
</fetch>`,
    childEntity: null, 
    fields: [
      { attributeType: "text", logicalName: "name", displayName: "topic" },
      {
        attributeType: "text",
        logicalName: "estimatedvalue",
        displayName: "Est.Revenue",
      },
    ], 
    childQuery: null, 
  },
];

/*
How to open the PCF comoponent in CRM

const paneInput = {
        pageType: "control",
        controlName: "fmfi_Fellowmind.HierarchyPCFControl",
        data: { etn: "account", id: "81d98094-b930-42db-ba2f-0f68aef85dd0", scriptValue: "testi_script" }
    };

    const navigationOptions = {
        target: 2,
        position: 1
    };

    Xrm.Navigation.navigateTo(paneInput, navigationOptions);
*/