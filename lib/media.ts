export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_STORED_IMAGE_BYTES = 3 * 1024 * 1024;
export const isMediaName = (name: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(
    name,
  );
