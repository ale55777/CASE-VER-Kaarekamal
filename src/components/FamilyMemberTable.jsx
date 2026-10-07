const rowTemplates = {
  rozgar: { name: '', age: '', educationOrInstitute: '', occupation: '', income: '' },
  case: { name: '', age: '', incomeSourceOrEducation: '', incomeOrFees: '', className: '' },
};

const columns = {
  rozgar: [
    ['name', 'Name / نام'],
    ['age', 'Age / عمر'],
    ['educationOrInstitute', 'Education / Institute / تعلیم / ادارہ'],
    ['occupation', 'Occupation / پیشہ'],
    ['income', 'Income / آمدنی'],
  ],
  case: [
    ['name', 'Full name / پورا نام'],
    ['age', 'Age / عمر'],
    ['incomeSourceOrEducation', 'Income source / Education / Institute'],
    ['incomeOrFees', 'Income / Fees'],
    ['className', 'Class / کلاس'],
  ],
};

export function FamilyMemberTable({ type, rows, onChange }) {
  const addRow = () => onChange([...rows, { ...rowTemplates[type] }]);
  const updateRow = (index, key, value) => {
    const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row));
    onChange(next);
  };
  const removeRow = (index) => {
    if (rows.length === 1) return;
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="member-table">
          <thead>
            <tr>
              {columns[type].map(([key, label]) => <th key={key}>{label}</th>)}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns[type].map(([key, label]) => (
                  <td key={key}>
                    <input
                      value={row[key] || ''}
                      onChange={(event) => updateRow(index, key, event.target.value)}
                      placeholder={label}
                      dir="auto"
                    />
                  </td>
                ))}
                <td>
                  <button type="button" className="text-button danger" onClick={() => removeRow(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="secondary-button" onClick={addRow}>+ Add Family Member</button>
    </div>
  );
}
