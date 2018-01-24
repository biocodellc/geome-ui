export const getFileExt = (filename) => {
  const parts = filename.split('.');
  return parts[ parts.length - 1 ] || undefined;
};
