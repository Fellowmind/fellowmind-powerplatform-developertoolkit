const GUID_PATTERN =
  /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;
const LOGICAL_NAME_PATTERN = /^[a-z][a-z0-9_]{0,127}$/i;
const CONFIG_NAME_PATTERN = /^[a-z0-9_-]{1,100}$/i;

/**
 * Values below originate from navigation/URL parameters (fullPageParam) or from
 * configuration JSON, so they must be validated/escaped before being placed into
 * OData filters, OData paths or FetchXML.
 */

export const isValidGuid = (value?: string): boolean =>
  !!value && GUID_PATTERN.test(value.trim());

export const isValidLogicalName = (value?: string): boolean =>
  !!value && LOGICAL_NAME_PATTERN.test(value.trim());

export const isValidConfigName = (value?: string): boolean =>
  !!value && CONFIG_NAME_PATTERN.test(value.trim());

export const sanitizeGuid = (value?: string): string | undefined =>
  isValidGuid(value) ? value!.trim().replace(/[{}]/g, "") : undefined;

export const sanitizeLogicalName = (value?: string): string | undefined =>
  isValidLogicalName(value) ? value!.trim().toLowerCase() : undefined;

export const sanitizeConfigName = (value?: string): string | undefined =>
  isValidConfigName(value) ? value!.trim() : undefined;

/** Escapes a value for use inside an OData string literal ('...'). */
export const escapeODataString = (value: string): string =>
  value.replace(/'/g, "''");

/** Escapes a value for use inside a double-quoted FetchXML attribute. */
export const escapeXmlAttribute = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * True only when the control is served from a local dev harness. Must never be a
 * substring test against the full URL, since a crafted query string
 * (?foo=localhost) would otherwise enable dev-only behaviour in production.
 */
export const isLocalDevHost = (): boolean => {
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
};
