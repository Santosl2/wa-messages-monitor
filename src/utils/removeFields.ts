export function removeUnusedFields(obj: object): object {
  
  Object.keys(obj).forEach((key) => {
    //@ts-expect-error
    const value = obj[key];
    if (key.startsWith("$$")) {
      //@ts-expect-error
      delete obj[key];
    } else if (typeof value === "object" && value !== null) {
      removeUnusedFields(value);
    }
  });

  return obj;
}
