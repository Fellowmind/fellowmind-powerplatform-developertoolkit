# ManyToManyLookup

A PCF (Power Apps Component Framework) control for model-driven apps that turns an N:N subgrid into an interactive tag picker.

Use it when you want users to quickly:
- See already associated related records as tags
- Add multiple related records from a lookup dialog
- Remove associations directly from the form
- Open a related record by clicking its tag

---

## What it is

`ManyToManyLookup` is designed to be used on a subgrid that represents a many-to-many relationship.

Behavior:
- Reads current associated records from the subgrid dataset
- Renders each related record as a tag chip
- Opens Dataverse lookup dialog when user clicks the add icon
- Associates selected records using Dataverse Web API `POST .../$ref`
- Disassociates records using Dataverse Web API `DELETE .../$ref`
- Refreshes subgrid after changes

The control discovers:
- Parent table from current form context
- Related table from the subgrid target entity
- Relationship name from subgrid metadata

This means it can work across different N:N relationships without hardcoding entity names in the control code.

---

## Prerequisites

- A model-driven app form
- Existing N:N relationship between parent and related tables
- A subgrid on the form bound to that N:N relationship
- User security roles that allow associate/disassociate operations for both tables

Important:
- The parent record must be saved (record ID must exist) before associations can be created.

---

## Configure (step by step)

### 1. Add the N:N subgrid to the form

1. Open the parent table main form in form editor.
2. Add a subgrid.
3. Set the subgrid to show related records from the target N:N relationship.
4. Save the form.

### 2. Add this PCF control to the subgrid

1. Select the subgrid on the form.
2. Go to **Components**.
3. Add component **FM ManyToMany Lookup**.
4. Enable the control for the clients you need (Web, Phone, Tablet).
5. Save and publish.

### 3. Configure control properties

| Property | Type | Required | Description |
|---|---|---|---|
| `records` | DataSet | Yes | Subgrid dataset source. Must be the N:N subgrid data. |
| `searchFields` | Text | No | Semicolon-separated searchable columns (example: `name;fullname`). Defaults to `name`. |

Notes:
- `searchFields` is available as a configurable input in the manifest.
- Lookup dialog view is inherited from the subgrid view when available.

### 4. Validate behavior on form

1. Open an existing parent record.
2. Verify related records are shown as tags.
3. Click the search icon to add one or more related records.
4. Click `x` on a tag to remove association.
5. Click tag text to open the related record form.

---

## How users interact with it

- **Add related records**: Click search icon, select one or more records, confirm.
- **Remove related record**: Click the remove icon (`x`) on a tag.
- **Open related record**: Click tag label.

The control shows a small loading spinner while updating associations.

---

## Troubleshooting

### No tags shown
- Confirm subgrid is bound to the correct N:N relationship.
- Confirm there are existing associated records.
- Confirm users can read related records.

### Add/remove fails
- Check user privileges for associate/disassociate on both tables.
- Check browser console for Web API errors.
- Confirm the parent record has been saved (has ID).

### Wrong records in lookup dialog
- Verify the subgrid view configuration.
- The control uses the subgrid view ID when available.

---

## Technical notes

- Uses PCF `WebAPI` and `Utility` features.
- Uses React + Fluent UI.
- Uses Dataverse Web API v9.2 association endpoints.
