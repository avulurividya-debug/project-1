function text(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}
function email(value) {
  const result = text(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : '';
}
function required(value, label) {
  if (!value) {
    const error = new Error(`${label} is required.`);
    error.status = 400;
    throw error;
  }
}
function oneOf(value, options, label) {
  if (!options.includes(value)) {
    const error = new Error(`${label} must be one of: ${options.join(', ')}.`);
    error.status = 400;
    throw error;
  }
  return value;
}
module.exports = { text, email, required, oneOf };
