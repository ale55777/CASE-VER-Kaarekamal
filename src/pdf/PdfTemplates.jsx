import { caseDocumentOptions, caseNeedOptions, caseScoring, rozgarDocumentOptions, rozgarSupportOptions, skillOptions } from '../data/forms.js';
import { calculateCaseScore } from '../utils/formUtils.js';

const ref = '/reference/';

function getTextContent(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(getTextContent).join('');
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object' && 'props' in value) return getTextContent(value.props.children);
  return '';
}

function getFitStyle({ text, w, h, small }) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const baseFont = small ? 13 : 18;
  const minFont = small ? 8 : 10;
  const lineHeight = small ? 1.12 : 1.15;
  const boxWidth = Math.max(1, (w / 100) * 800);
  const boxHeight = Math.max(1, (h / 100) * 1060);
  let fontSize = baseFont;

  while (fontSize > minFont) {
    const charsPerLine = Math.max(1, Math.floor(boxWidth / (fontSize * 0.58)));
    const estimatedLines = Math.max(1, Math.ceil(cleanText.length / charsPerLine));
    const maxLines = Math.max(1, Math.floor(boxHeight / (fontSize * lineHeight)));
    if (estimatedLines <= maxLines) break;
    fontSize -= 1;
  }

  return {
    '--pdf-font-size': `${fontSize}px`,
    '--pdf-line-height': lineHeight,
    '--pdf-value-lift': h <= 2 ? '-8px' : h <= 3 ? '-6px' : '-4px',
  };
}

function Value({ x, y, w, h, children, rtl = true, small = false }) {
  const text = getTextContent(children);
  const fitStyle = getFitStyle({ text, w, h, small });

  return (
    <div
      className={`pdf-value ${small ? 'small' : ''}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, ...fitStyle }}
      dir={rtl ? 'auto' : 'ltr'}
    >
      {children}
    </div>
  );
}

function Mark({ x, y, active }) {
  return active ? <div className="pdf-check" style={{ left: `${x}%`, top: `${y}%` }} /> : null;
}

function has(list, value) {
  return list?.includes(value);
}

export function RozgarPdfTemplate({ data }) {
  const members = data.familyMembers.filter((row) => Object.values(row).some(Boolean));
  return (
    <div className="pdf-document">
      <section className="pdf-page letter" data-pdf-width="612" data-pdf-height="792">
        <img src={`${ref}Rozgar_Verification_Form_page_1.png`} alt="" />
        <Value x={17} y={14.1} w={15} h={2}>{data.applicant.date}</Value>
        <Value x={18} y={20.8} w={28} h={2}>{data.applicant.name}</Value>
        <Value x={22} y={22.6} w={23} h={2}>{data.applicant.cnic}</Value>
        <Value x={23} y={24.4} w={22} h={2}>{data.applicant.fatherName}</Value>
        <Value x={18} y={26.2} w={28} h={2}>{data.applicant.phone}</Value>
        <Value x={12} y={39.2} w={76} h={8}>{data.familyBackground.details}</Value>
        <Value x={24} y={49.6} w={37} h={2}>{data.address.completeAddress}</Value>
        <Value x={23} y={51.6} w={27} h={2}>{data.address.city}</Value>
        <Value x={28} y={54.7} w={16} h={2}>{data.address.rentAmount}</Value>
        <Value x={28} y={56.7} w={18} h={2}>{data.address.electricBill}</Value>
        <Value x={31} y={58.9} w={18} h={2}>{data.address.transport}</Value>
        <Value x={12} y={62.8} w={76} h={4}>{data.address.householdItems || data.address.houseDetails}</Value>
        <Value x={18} y={68.6} w={28} h={2}>{data.familySlip.name}</Value>
        <Value x={21} y={70.5} w={24} h={2}>{data.familySlip.cnic}</Value>
        <Value x={18} y={72.3} w={27} h={2}>{data.familySlip.phone}</Value>
        <Value x={24} y={74.1} w={23} h={2}>{data.familySlip.address}</Value>
        <Value x={13} y={80.4} w={75} h={5} small>
          {members.slice(0, 3).map((m, i) => `${i + 1}. ${m.name}، عمر ${m.age}، ${m.educationOrInstitute}، ${m.occupation}، آمدنی ${m.income}`).join(' | ')}
        </Value>
        <Value x={24} y={86.6} w={20} h={2}>{data.familyTotals.monthlyIncome}</Value>
        <Value x={33} y={88.4} w={27} h={2}>{data.familyTotals.secondSourceSupport}</Value>
        <Mark x={12.1} y={92.8} active={has(data.skills.selected, 'tailoring')} />
        <Mark x={39.6} y={92.8} active={has(data.skills.selected, 'driver')} />
        <Mark x={12.1} y={94.9} active={has(data.skills.selected, 'electrician')} />
        <Mark x={39.6} y={94.9} active={has(data.skills.selected, 'shopkeeper')} />
        <Mark x={12.1} y={97.0} active={has(data.skills.selected, 'mechanic')} />
        <Mark x={39.6} y={97.0} active={has(data.skills.selected, 'laborer')} />
        <Mark x={67.1} y={92.8} active={has(data.skills.selected, 'other')} />
        <Value x={71} y={94.2} w={21} h={2}>{data.skills.other}</Value>
        <Value x={75} y={97.1} w={14} h={2}>{data.skills.experienceYears}</Value>
      </section>
      <section className="pdf-page letter" data-pdf-width="612" data-pdf-height="792">
        <img src={`${ref}Rozgar_Verification_Form_page_2.png`} alt="" />
        <Value x={12} y={16.2} w={76} h={3}>{data.plan.workToStart}</Value>
        <Value x={12} y={22.2} w={76} h={3}>{data.plan.equipment}</Value>
        <Value x={12} y={29.0} w={76} h={2}>{data.plan.estimatedCost}</Value>
        <Value x={12} y={35.7} w={76} h={2}>{data.plan.expectedIncome}</Value>
        <Mark x={12.1} y={43.5} active={has(data.support.selected, 'tools')} />
        <Mark x={12.1} y={45.8} active={has(data.support.selected, 'shopItems')} />
        <Mark x={12.1} y={48.3} active={has(data.support.selected, 'rickshaw')} />
        <Mark x={12.1} y={50.8} active={has(data.support.selected, 'sewingMachine')} />
        <Mark x={12.1} y={53.2} active={has(data.support.selected, 'other')} />
        <Value x={19} y={53.0} w={24} h={2}>{data.support.other}</Value>
        <Value x={20} y={55.8} w={22} h={2}>{data.support.estimatedCost}</Value>
        <Mark x={12.1} y={66.1} active={data.potential.canSelfSustain === 'yes'} />
        <Mark x={12.1} y={68.8} active={data.potential.canSelfSustain === 'no'} />
        <Value x={12} y={71.0} w={76} h={3}>{data.potential.details}</Value>
        <Value x={20} y={80.0} w={19} h={2}>{data.verification.chairmanName}</Value>
        <Value x={28} y={82.5} w={26} h={2}>{data.verification.referredBy}</Value>
        <Value x={12} y={86.0} w={76} h={5}>{data.verification.teamOpinion}</Value>
        <Value x={18} y={94.3} w={22} h={2}>{data.verification.verificationDate}</Value>
        {rozgarDocumentOptions.map((opt, index) => (
          <Mark key={opt.value} x={12.1} y={77.2 + index * 2.45} active={has(data.documents.selected, opt.value)} />
        ))}
      </section>
    </div>
  );
}

export function CasePdfTemplate({ data }) {
  const members = data.familyMembers.filter((row) => Object.values(row).some(Boolean));
  const total = calculateCaseScore(data.scoring, caseScoring);
  return (
    <div className="pdf-document">
      <section className="pdf-page a4" data-pdf-width="595.32" data-pdf-height="841.92">
        <img src={`${ref}Case_Verification_Form-1-1_page_1.png`} alt="" />
        <Value x={4} y={9.8} w={23} h={3}>{data.header.date}</Value>
        <Value x={89} y={9.6} w={8} h={3}>{data.header.formNumber}</Value>
        <Value x={74} y={15.6} w={23} h={3}>{data.applicant.familyHeadName}</Value>
        <Value x={73} y={20.3} w={24} h={3}>{data.applicant.guardianName}</Value>
        <Value x={41} y={15.7} w={32} h={3}>{data.applicant.cnic}</Value>
        <Value x={39} y={20.4} w={33} h={3}>{data.applicant.phone}</Value>
        <Value x={22} y={25.0} w={62} h={3}>{data.applicant.address}</Value>
        <Value x={2} y={24.9} w={19} h={3}>{data.applicant.city}</Value>
        <Value x={3} y={38.0} w={94} h={20}>{data.familyNeed.details}</Value>
        <Value x={4} y={63.0} w={42} h={3}>{data.household.details}</Value>
        <Mark x={37.6} y={66.1} active={data.household.ownership} />
        <Value x={3} y={68.8} w={10} h={3}>{data.household.rentAmount}</Value>
        <Value x={43} y={68.8} w={24} h={3}>{data.household.transport}</Value>
        <Value x={34} y={75.8} w={25} h={3}>{data.household.basicItems}</Value>
        <Value x={54} y={80.2} w={18} h={3}>{data.household.electricBill}</Value>
        <Value x={3} y={85.5} w={30} h={3}>{data.household.hasSeparateElectricMeter}</Value>
        <Value x={39} y={89.3} w={22} h={3}>{data.household.medicineExpense}</Value>
        <Value x={3} y={94.3} w={40} h={3}>{data.household.loanDetails}</Value>
        <Value x={3} y={98.0} w={94} h={3}>{data.household.illnessDetails}</Value>
      </section>
      <section className="pdf-page a4" data-pdf-width="595.32" data-pdf-height="841.92">
        <img src={`${ref}Case_Verification_Form-1-1_page_2.png`} alt="" />
        <Value x={30} y={2.2} w={13} h={3}>{data.totals.childrenCount}</Value>
        <Value x={60} y={2.2} w={16} h={3}>{data.totals.totalFamilyMembers}</Value>
        {members.slice(0, 6).map((m, i) => (
          <div key={i}>
            <Value x={68} y={9.7 + i * 3.64} w={28} h={3} small>{m.name}</Value>
            <Value x={59} y={9.7 + i * 3.64} w={7} h={3} small>{m.age}</Value>
            <Value x={28} y={9.7 + i * 3.64} w={30} h={3} small>{m.incomeSourceOrEducation}</Value>
            <Value x={12} y={9.7 + i * 3.64} w={14} h={3} small>{m.incomeOrFees}</Value>
            <Value x={3} y={9.7 + i * 3.64} w={8} h={3} small>{m.className}</Value>
          </div>
        ))}
        <Value x={33} y={37.0} w={27} h={3}>{data.totals.secondSourceSupport}</Value>
        <Value x={23} y={39.8} w={20} h={3}>{data.totals.totalIncome}</Value>
        <Mark x={53.7} y={39.8} active={has(data.needs.selected, 'ration')} />
        <Mark x={36.0} y={39.8} active={has(data.needs.selected, 'medicine')} />
        <Mark x={20.1} y={39.8} active={has(data.needs.selected, 'fees')} />
        <Mark x={2.5} y={39.8} active={has(data.needs.selected, 'rozgar')} />
        <Value x={3} y={45.3} w={94} h={8}>{data.appearance.details}</Value>
        <Value x={52} y={56.0} w={22} h={3}>{data.verification.teamMemberName}</Value>
        <Value x={8} y={56.0} w={20} h={3}>{data.verification.createdBy}</Value>
        <Value x={44} y={59.8} w={23} h={3}>{data.verification.referredBy}</Value>
        <Value x={36} y={63.2} w={24} h={3}>{data.verification.handedTo}</Value>
        {caseDocumentOptions.map((opt, index) => {
          const positions = [
            [94.0, 66.8], [94.0, 70.6], [94.0, 74.4], [75.8, 66.8], [66.8, 70.6], [45.8, 66.8], [36.8, 70.6],
          ];
          const [x, y] = positions[index];
          return <Mark key={opt.value} x={x} y={y} active={has(data.documents.selected, opt.value)} />;
        })}
        {caseScoring.map((item, index) => {
          const left = index < 6;
          const row = left ? index : index - 6;
          const yesX = left ? 37.7 : 87.8;
          const noX = left ? 41.9 : 92.0;
          const y = 83.5 + row * 2.76;
          return (
            <div key={item.key}>
              <Mark x={yesX} y={y} active={data.scoring[item.key] === 'yes'} />
              <Mark x={noX} y={y} active={data.scoring[item.key] === 'no'} />
            </div>
          );
        })}
        <Value x={78} y={97.0} w={15} h={3} rtl={false}>{total}</Value>
      </section>
    </div>
  );
}
