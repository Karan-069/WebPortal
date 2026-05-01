/**
 * Evaluates a declarative condition against a set of values.
 *
 * Condition Format:
 * { field: 'fieldName', operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'in', value: any }
 *
 * Or a function:
 * (values) => boolean
 */
export function evaluateCondition(condition, values) {
  if (!condition) return true;

  if (typeof condition === "function") {
    return condition(values);
  }

  if (!values) return false;
  const { field, operator = "eq", value } = condition;
  const fieldValue = values[field];

  switch (operator) {
    case "eq":
      return fieldValue === value;
    case "neq":
      return fieldValue !== value;
    case "gt":
      return Number(fieldValue) > Number(value);
    case "lt":
      return Number(fieldValue) < Number(value);
    case "contains":
      return String(fieldValue || "")
        .toLowerCase()
        .includes(String(value).toLowerCase());
    case "in":
      return Array.isArray(value) ? value.includes(fieldValue) : false;
    default:
      return fieldValue === value;
  }
}
