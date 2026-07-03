# MergeFiles

`MergeFiles` contains the `MergeFileHelper` Dataverse plug-in package for merging files through a custom API.

The current implementation supports merging PDF files. The custom API receives one or more Base64 encoded PDF payloads, merges the pages in the same order, and returns the merged PDF as a Base64 string.

---

## Project

| Item | Value |
|---|---|
| Project | `MergeFileHelper.csproj` |
| Assembly | `MergeFileHelper` |
| Plug-in class | `MergeFileHelper.MergeFileHelper` |
| Target framework | .NET Framework 4.6.2 |
| Package ID | `MergeFileHelper` |
| Package version | `1.0.1` |
| Package output | `bin\outputPackages` |

The project is strong-name signed with `MergeFileHelper.snk` and generates a NuGet plug-in package on build.

---

## Custom API configuration

Create an unbound custom API and register `MergeFileHelper.MergeFileHelper` as the plug-in type.

Use your solution publisher prefix for the custom API name, for example:

```text
fellowmind_MergeFile
```

### Input parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `mergefilehelper_FileType` | String | Yes | File type to merge. Must be `pdf`. |
| `mergefilehelper_FileBase64String` | String | Yes | One or more Base64 encoded PDF files joined with a pipe character (`|`). |

### Output parameters

| Parameter | Type | Description |
|---|---|---|
| `mergefilehelper_MergedFileBase64` | String | The merged PDF file encoded as Base64. |

---

## Behavior

- Only `pdf` is supported as `mergefilehelper_FileType`.
- File type comparison is case-insensitive.
- Files are merged in the order they appear in `mergefilehelper_FileBase64String`.
- Empty input parameters are rejected.
- Empty file payloads between separators are rejected.
- Invalid Base64 content returns an `InvalidPluginExecutionException`.
- Invalid PDF content returns an `InvalidPluginExecutionException`.

---

## Build

From `Actions\MergeFiles`:

```powershell
.\nuget.exe restore MergeFileHelper.csproj -PackagesDirectory ..\packages
msbuild .\MergeFileHelper.csproj /p:Configuration=Release
```

The package is generated under:

```text
Actions\MergeFiles\bin\outputPackages
```

You can also build it from the actions solution:

```powershell
msbuild ..\fellowmind.developertoolkit.plugins.sln /p:Configuration=Release /m
```

---

## Power Automate usage

See [MergeFile_PowerAutomate.md](MergeFile_PowerAutomate.md) for an example of calling the custom API from Power Automate and saving the merged PDF.
