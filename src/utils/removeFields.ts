export function removeUnusedFields(obj: object): void {
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (key.startsWith("$$")) {
      delete obj[key];
    } else if (typeof value === "object" && value !== null) {
      removeUnusedFields(value);
    }
  });

  return obj;
}
