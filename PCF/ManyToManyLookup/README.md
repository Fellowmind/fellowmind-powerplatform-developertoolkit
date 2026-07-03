# ManyToManyLookup

`ManyToManyLookup` is a Power Apps Component Framework (PCF) control for model-driven apps. It renders records from an N:N subgrid as clickable tags and lets users add or remove related records directly from the form.

Use it when users need a compact way to:
- View associated N:N records as tags
- Add one or more related records through a lookup dialog
- Remove associations from the form without opening the subgrid
- Open an associated record by clicking its tag

---

## How it works

The control is designed for a model-driven form subgrid that is bound to a many-to-many relationship.

At runtime it:
- Reads the associated records from the configured subgrid dataset
- Gets the parent table from the current form context
- Gets the related table from the subgrid target entity
- Gets the N:N relationship name from the subgrid metadata
- Opens the Dataverse lookup dialog for the related table
- Associates selected records with Dataverse Web API `POST .../$ref`
- Disassociates removed records with Dataverse Web API `DELETE .../$ref`
- Refreshes the subgrid dataset after add/remove operations

Because table and relationship metadata is discovered from the subgrid, the same control can be reused across different N:N relationships without hardcoding table names.

---

## Prerequisites

- A model-driven app form
- An existing many-to-many relationship between the parent table and related table
- A subgrid on the form that shows records from that N:N relationship
- User privileges to read, associate, and disassociate records for both tables
- A saved parent record; associations cannot be created before the parent row has an ID

---

## Configure the control

### 1. Add the N:N subgrid

1. Open the parent table main form in the form editor.
2. Add a subgrid.
3. Configure the subgrid to show related records from the target N:N relationship.
4. Select the view that should be used by the lookup dialog.
5. Save the form.

### 2. Add the PCF control to the subgrid

1. Select the subgrid on the form.
2. Go to **Components**.
3. Add **FM ManyToMany Lookup**.
4. Enable the control for the required clients, such as Web, Phone, or Tablet.
5. Save and publish the form.

### 3. Configure properties

| Property | Type | Required | Description |
|---|---|---:|---|
| `records` | DataSet | Yes | The N:N subgrid dataset. This must be the subgrid that contains the associated related records. |
| `addMoreText` | Single line text | No | Text displayed next to the search icon. Defaults to `Add more`. |
| `nameField` | Single line text | No | Related table column logical name used as the visible tag label. Defaults to the related table primary name column. |

If `nameField` is not configured, the control uses the related table primary name attribute from Dataverse metadata. If no value is available for that field, it falls back to `name`, then `fullname`, then the record ID.

---

## User experience

- **Add records**: Select the search icon or `Add more` text, choose one or more records in the lookup dialog, and confirm.
- **Remove a record**: Select the remove icon on a tag.
- **Open a record**: Select the tag label.

The control shows a small spinner while association or disassociation requests are running. Add actions are ignored while an update is already in progress.

---

## Lookup dialog behavior

The lookup dialog is opened for the related table detected from the subgrid. When the subgrid view ID is available, the control passes that view as the default and allowed lookup view so users search within the same view configuration as the subgrid.

The lookup allows multiple selections. Records that are already associated and visible in the current dataset are ignored when selected again.

---

## Development

From `PCF\ManyToManyLookup`:

```powershell
npm install
npm run build
npm test
```

Useful scripts:

| Command | Purpose |
|---|---|
| `npm run build` | Build the PCF control. |
| `npm run rebuild` | Clean and rebuild the PCF control. |
| `npm run start` | Start the PCF test harness. |
| `npm run start:watch` | Start the PCF test harness in watch mode. |
| `npm test` | Run Jest tests. |
| `npm run lint` | Run linting. |

---

## Troubleshooting

### No tags are shown

- Confirm the subgrid is bound to the correct N:N relationship.
- Confirm the parent record already has associated records.
- Confirm the current user can read the related table records.
- Confirm the column configured in `nameField` is included in the subgrid dataset or leave it empty to use the primary name column.

### Add fails

- Confirm the parent record has been saved.
- Confirm the current user has privileges to associate records for both tables.
- Check the browser console for `Associate failed` errors.
- Confirm the relationship metadata is available from the subgrid.

### Remove fails

- Confirm the current user has privileges to disassociate records for both tables.
- Check the browser console for `Disassociate failed` errors.
- Confirm the tag record still exists and is still associated with the parent record.

### Wrong records appear in the lookup dialog

- Verify the subgrid view configuration.
- Confirm the subgrid is bound to the intended related table and N:N relationship.

---

## Technical notes

- Control namespace: `Fellowmind`
- Constructor: `ManyToManyLookup`
- Display name: `FM ManyToMany Lookup`
- Control type: virtual React PCF control
- Uses platform React `16.8.6`
- Uses platform Fluent UI `8.104.1`
- Uses PCF `WebAPI` and `Utility` features
- Uses Dataverse Web API v9.2 association endpoints
