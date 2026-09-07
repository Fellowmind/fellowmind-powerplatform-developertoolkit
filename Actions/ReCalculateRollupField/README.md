# ReCalculateRollupField Custom API

`ReCalculateRollupFieldPlugin` implements an unbound Dataverse Custom API that
requests an immediate calculation of one rollup column on one record.

## Custom API registration

Register the assembly and `Fellowmind.ReCalculateRollupFieldPlugin`
type before creating the Custom API.

| Setting | Value |
| --- | --- |
| Display name | ReCalculateRollupField |
| Name | ReCalculateRollupField |
| Unique name | `fmfi_ReCalculateRollupField` |
| Binding type | Global |
| Is function | No |
| Enabled for workflow | Yes, when Power Automate invocation is required |
| Allowed custom processing step type | None |
| Execution privilege | Leave empty unless invocation must be restricted by a specific privilege |
| Main operation plug-in type | `Fellowmind.ReCalculateRollupFieldPlugin` |

Create these required request parameters in the listed order. Do not create
response properties.

| Name and unique name | Type | Optional |
| --- | --- | --- |
| `fmfi_recalculaterollupfield_EntityName` | String | No |
| `fmfi_recalculaterollupfield_Id` | Guid | No |
| `fmfi_recalculaterollupfield_FieldName` | String | No |

The plug-in creates its organization service with the execution context user.
Callers therefore retain their effective Dataverse privileges; the API does not
elevate access.

## Web API invocation

Send an authenticated request to the environment Web API:

```http
POST https://<environment>.crm.dynamics.com/api/data/v9.2/fmfi_ReCalculateRollupField
OData-MaxVersion: 4.0
OData-Version: 4.0
Accept: application/json
Content-Type: application/json; charset=utf-8

{
  "EntityName": "account",
  "Id": "00000000-0000-0000-0000-000000000001",
  "FieldName": "new_totalrevenue"
}
```

A successful request has no response properties. Dataverse errors from record
lookup, column validation, rollup calculation, security, or throttling are
returned to the caller.

## Manual validation checklist

Use a non-production Dataverse environment containing a known rollup column.
Enable plug-in trace logging while validating failure cases.

1. Invoke the API with a valid table logical name, record ID, and rollup column
   logical name. Confirm the call succeeds and the rollup column is recalculated.
2. Omit `EntityName`, send it as an incompatible type, and send whitespace.
   Confirm each call fails and the message identifies `EntityName`.
3. Omit `Id`, send it as an incompatible type, and send the empty GUID. Confirm
   each call fails and the message identifies `Id`.
4. Omit `FieldName`, send it as an incompatible type, and send whitespace.
   Confirm each call fails and the message identifies `FieldName`.
5. Invoke the API with an unknown table, a missing record, an unknown column,
   and a column that is not a rollup. Confirm each Dataverse failure reaches the
   caller rather than producing a successful response.
6. Invoke the valid request as a user without the required record or table
   privileges. Confirm the request fails with a Dataverse security error.
7. Review the plug-in trace and confirm it records the API name, target logical
   names, record ID, and successful completion without logging record data.
