export function getObjectDiff<T extends Record<string, unknown>>(
  original: T,
  modified: T,
  allowedFields?: (keyof T)[]
): Partial<T> {
  const diff: Partial<T> = {};
  
  const fieldsToCheck = allowedFields || (Object.keys(modified) as (keyof T)[]);
  
  for (const key of fieldsToCheck) {
    // Verifica se o valor foi modificado
    if (modified[key] !== undefined && modified[key] !== original[key]) {
      // Tratamento especial para valores numéricos
      if (typeof original[key] === 'number' && typeof modified[key] === 'number') {
        if (original[key] !== modified[key]) {
          diff[key] = modified[key];
        }
      } 
      // Tratamento para strings vazias
      else if (typeof modified[key] === 'string') {
        const trimmedValue = (modified[key] as string).trim();
        if (trimmedValue !== original[key]) {
          diff[key] = trimmedValue as T[keyof T];
        }
      }
      // Outros tipos
      else if (modified[key] !== original[key]) {
        diff[key] = modified[key];
      }
    }
  }
  
  return diff;
}