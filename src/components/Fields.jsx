import { formatCnic, formatPhone, getNestedValue, setNestedValue, toggleArrayValue } from '../utils/formUtils.js';

export function Field({ label, urdu, children, error }) {
  return (
    <label className="field">
      <span className="field-label">
        <span>{label}</span>
        {urdu && <span className="urdu" dir="rtl">{urdu}</span>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function TextInput({ data, setData, path, label, urdu, type = 'text', required, multiline }) {
  const value = getNestedValue(data, path);
  const onChange = (event) => {
    let nextValue = event.target.value;
    if (type === 'cnic') nextValue = formatCnic(nextValue);
    if (type === 'tel') nextValue = formatPhone(nextValue);
    setData((current) => setNestedValue(current, path, nextValue));
  };
  const common = {
    value,
    onChange,
    required,
    dir: 'auto',
    placeholder: urdu || label,
  };
  return (
    <Field label={label} urdu={urdu}>
      {multiline ? <textarea {...common} rows={4} /> : <input {...common} type={type === 'cnic' ? 'text' : type} />}
    </Field>
  );
}

export function RadioGroup({ data, setData, path, label, urdu, options }) {
  const value = getNestedValue(data, path);
  return (
    <Field label={label} urdu={urdu}>
      <div className="choice-row">
        {options.map((option) => (
          <label className="choice" key={option.value}>
            <input
              type="radio"
              name={path}
              checked={value === option.value}
              onChange={() => setData((current) => setNestedValue(current, path, option.value))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export function CheckboxGroup({ values, onChange, label, urdu, options }) {
  return (
    <Field label={label} urdu={urdu}>
      <div className="checkbox-grid">
        {options.map((option) => (
          <label className="choice" key={option.value}>
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => onChange(toggleArrayValue(values, option.value))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export function SectionTitle({ title, urdu, intro }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {urdu && <p className="urdu" dir="rtl">{urdu}</p>}
      {intro && <p>{intro}</p>}
    </div>
  );
}
