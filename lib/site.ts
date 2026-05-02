function normalizeSiteUrl(input: string) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) {
    return "http://localhost:3000";
  }

  return normalizeSiteUrl(value);
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function getAbsoluteUrl(pathname = "/") {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}
