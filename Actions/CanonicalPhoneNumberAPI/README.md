# Canonical Phone Number Custom API

`Fellowmind.CanonicalPhoneNumberPlugin` implements the unbound,
synchronous Dataverse Custom API `fmfi_CanonicalPhoneNumber`.

## Registration

| Setting | Value |
| --- | --- |
| Unique name | `fmfi_CanonicalPhoneNumber` |
| Binding type | Global (unbound) |
| Allowed processing step type | None |
| Main operation plug-in | `Fellowmind.CanonicalPhoneNumberPlugin` |
| Execution | Synchronous |

Request parameters:

| Unique name | Type | Required |
| --- | --- | --- |
| `ExistingPhoneNumber` | String | Yes |
| `CountryCode` | String | Yes |

Response properties:

| Unique name | Type |
| --- | --- |
| `Success` | Boolean |
| `Response` | String |

Build and register the strong-name-signed `CanonicalPhoneNumberAPI.dll` as a
normal Dataverse plug-in assembly. The assembly has no non-platform runtime
dependencies and does not require a plug-in package.

## Examples

National input:

```json
{
  "ExistingPhoneNumber": "040 123 4567",
  "CountryCode": "FIN"
}
```

Successful response:

```json
{
  "Success": true,
  "Response": "+358401234567"
}
```

Validation response:

```json
{
  "Success": false,
  "Response": "The phone number length is invalid for country 'FIN'."
}
```

For international input, `+` and `00` prefixes are recognized. The source
calling code is removed and the remaining national significant number is
rebased to the supplied target country.

## Validation limits

Validation is structural. Success means that the input syntax is supported,
the country and calling code are known, the national significant number has a
configured length, and the result fits the E.164 15-digit limit. It does not
prove that the number is allocated, reachable, or associated with a particular
carrier, area, mobile service, or landline service.

The initial built-in metadata covers Australia, Austria, Belgium, Bulgaria,
Canada, China, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France,
Germany, Greece, Hungary, Iceland, India, Ireland, Italy, Japan, Latvia,
Liechtenstein, Lithuania, Luxembourg, Malta, the Netherlands, New Zealand,
Norway, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden,
Switzerland, the United Kingdom, and the United States. Other syntactically
valid ISO alpha-3 codes return an unsupported-country response.

## Metadata sources

- ISO 3166-1 alpha-3 codes: <https://www.iso.org/obp/ui/#search>
- ITU-T E.164 assigned calling codes:
  <https://www.itu.int/oth/T0202.aspx?parent=T0202>

Sources were reviewed on 2026-08-31. National trunk prefixes and permitted
lengths are maintained explicitly in `CountryPhoneMetadata.cs`; update them
through a reviewed code change when numbering plans change.

## Local verification

```powershell
msbuild .\CanonicalPhoneNumberAPI.Tests.csproj /p:Configuration=Release
.\bin\Tests\Release\CanonicalPhoneNumberAPI.Tests.exe
```
