# Merge File - Power Automate Guide

This guide shows how to call the `MergeFileHelper` custom API from Power Automate and save the merged PDF output.

## Custom API name

Use your solution publisher prefix, for example `fellowmind_MergeFile`.

---

## Supported file types

Only PDF files are currently supported.

Set the file type parameter to:

```text
pdf
```

---

## Input parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `mergefilehelper_FileType` | String | Yes | Must be `pdf`. Other file types are not supported yet. |
| `mergefilehelper_FileBase64String` | String | Yes | One or more PDF files encoded as Base64, joined by a pipe `\|` character. |

### How to build the input string in Power Automate

1. Get file content for each PDF, for example with the SharePoint **Get file content** action.
2. Use the `$content` property from each file content action. It is already Base64 encoded.
3. Join the Base64 values with a pipe using the `join()` expression:

```
join(array(outputs('Get_file_content_1')?['body']['$content'], outputs('Get_file_content_2')?['body']['$content']), '|')
```

Or for a dynamic array of files collected in an **Apply to each**:

```
join(variables('FileArray'), '|')
```

---

## Output parameters

| Parameter | Type | Description |
|---|---|---|
| `mergefilehelper_MergedFileBase64` | String | The merged PDF file encoded as Base64. |

### How to use the output in Power Automate

To save the merged file to SharePoint use **Create file** and set the file content to:

```
base64ToBinary(outputs('Perform_an_unbound_action')?['body/mergefilehelper_MergedFileBase64'])
```

---

## Example - Perform an unbound action

Use **Microsoft Dataverse > Perform an unbound action**.

| Field | Value |
|---|---|
| Action name | Your custom API name, for example `fellowmind_MergeFile`. |
| `mergefilehelper_FileType` | `pdf` |
| `mergefilehelper_FileBase64String` | Pipe-separated Base64 PDF payloads. |

---

## Example - Unbound Action request body

```json
{
  "mergefilehelper_FileType": "pdf",
  "mergefilehelper_FileBase64String": "<base64pdf1>|<base64pdf2>|<base64pdf3>"
}
```

---

## Error handling

The custom API returns a plug-in error when:

- `mergefilehelper_FileType` is missing, empty, or not `pdf`
- `mergefilehelper_FileBase64String` is missing or empty
- The pipe-separated file string contains an empty payload
- One or more payloads are not valid Base64 strings
- One or more payloads are not valid PDF documents

---

## Notes

- Only PDF merge is currently supported.
- Files are merged in the order they appear in the string.
- The output file is returned as a Base64 string - convert it with `base64ToBinary()` before saving as a file.
