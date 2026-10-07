export function setNestedValue(source, path, value) {
  const next = structuredClone(source);
  const keys = path.split('.');
  let cursor = next;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[keys.at(-1)] = value;
  return next;
}

export function getNestedValue(source, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], source) ?? '';
}

export function toggleArrayValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function formatCnic(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function formatPhone(value) {
  return value.replace(/[^\d+ -]/g, '').slice(0, 18);
}

export function isValidCnic(value) {
  return /^\d{5}-\d{7}-\d$/.test(value);
}

export function sanitizeFilename(value) {
  return (value || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function calculateCaseScore(scoring, scoringConfig) {
  return scoringConfig.reduce((sum, item) => {
    if (scoring[item.key] === 'yes') return sum + item.yes;
    if (scoring[item.key] === 'no') return sum + item.no;
    return sum;
  }, 0);
}

export function makeFilename(formType, data) {
  const date = todayIso();
  const rawName =
    formType === 'case' ? data.applicant.familyHeadName : data.applicant.name;
  const name = sanitizeFilename(rawName);
  const prefix = formType === 'case' ? 'Case_Verification' : 'Rozgar_Verification';
  return `${prefix}${name ? `_${name}` : ''}_${date}.pdf`;
}
