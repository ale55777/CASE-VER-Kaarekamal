import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, FileCheck, Printer, RotateCcw, Save } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckboxGroup, RadioGroup, SectionTitle, TextInput } from '../components/Fields.jsx';
import { FamilyMemberTable } from '../components/FamilyMemberTable.jsx';
import { Review } from '../components/Review.jsx';
import { caseDocumentOptions, caseNeedOptions, caseScoring, formConfigs, rozgarDocumentOptions, rozgarSupportOptions, skillOptions } from '../data/forms.js';
import { CasePdfTemplate, RozgarPdfTemplate } from '../pdf/PdfTemplates.jsx';
import { generatePdfFromElement } from '../pdf/generatePdf.js';
import { calculateCaseScore, isValidCnic, makeFilename, setNestedValue } from '../utils/formUtils.js';

const yesNo = [
  { value: 'yes', label: 'Yes / ہاں' },
  { value: 'no', label: 'No / نہیں' },
];

function useDraft(config) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(config.storageKey);
    return saved ? JSON.parse(saved) : config.initialData;
  });
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(config.storageKey, JSON.stringify(data));
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [data, config.storageKey]);

  const clear = () => {
    if (!window.confirm('Clear this saved draft?')) return;
    localStorage.removeItem(config.storageKey);
    setData(structuredClone(config.initialData));
  };

  return { data, setData, savedAt, clear };
}

function validateStep(type, step, data) {
  const errors = [];
  if (type === 'case') {
    if (step === 0 && !data.applicant.familyHeadName) errors.push('Family head name is required.');
    if (step === 0 && data.applicant.cnic && !isValidCnic(data.applicant.cnic)) errors.push('CNIC must use 00000-0000000-0 format.');
    if (step === 4 && caseScoring.some((item) => !data.scoring[item.key])) errors.push('Please answer all scoring questions.');
  } else {
    if (step === 0 && !data.applicant.name) errors.push('Applicant name is required.');
    if (step === 0 && data.applicant.cnic && !isValidCnic(data.applicant.cnic)) errors.push('CNIC must use 00000-0000000-0 format.');
    if (step === 4 && !data.potential.canSelfSustain) errors.push('Future potential yes/no answer is required.');
  }
  return errors;
}

export default function FormPage() {
  const { formType } = useParams();
  const config = formConfigs[formType];
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [filename, setFilename] = useState('');
  const pdfRef = useRef(null);

  if (!config) return <Navigate to="/" replace />;

  const { data, setData, savedAt, clear } = useDraft(config);
  const steps = formType === 'case' ? caseSteps(data, setData) : rozgarSteps(data, setData);
  const reviewStep = step === steps.length;
  const generated = Boolean(pdfUrl);

  const next = () => {
    const stepErrors = validateStep(formType, step, data);
    setErrors(stepErrors);
    if (stepErrors.length) return;
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const generate = async () => {
    setErrors([]);
    const doc = await generatePdfFromElement(pdfRef.current);
    const blob = doc.output('blob');
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(blob));
    setFilename(makeFilename(formType, data));
  };

  const startNew = () => {
    clear();
    setPdfUrl('');
    setStep(0);
  };

  const printPdf = () => {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.src = pdfUrl;
    document.body.appendChild(frame);
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    };
  };

  return (
    <main className="app-shell">
      <header className="form-header">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Forms</Link>
        <div>
          <p>Kaar-e-Kamal Welfare Foundation</p>
          <h1>{config.title}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={clear}>Clear Form</button>
      </header>

      <section className="progress-panel">
        <div>
          <span>{reviewStep ? 'Review & Confirm' : steps[step].title}</span>
          <strong>Step {Math.min(step + 1, steps.length + 1)} of {steps.length + 1}</strong>
        </div>
        <div className="progress-track"><span style={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }} /></div>
        <small><Save size={14} /> Draft saved {savedAt || 'locally'}</small>
      </section>

      <section className="form-surface">
        {generated ? (
          <div className="success-panel">
            <FileCheck size={48} />
            <h2>PDF Generated Successfully</h2>
            <p>Your form data is still editable in this application.</p>
            <div className="button-row">
              <a className="primary-button" href={pdfUrl} download={filename}><Download size={18} /> Download PDF</a>
              <button className="secondary-button" type="button" onClick={printPdf}><Printer size={18} /> Print</button>
              <button className="secondary-button" type="button" onClick={() => setPdfUrl('')}>Edit Form</button>
              <button className="text-button danger" type="button" onClick={startNew}><RotateCcw size={18} /> Start New Form</button>
            </div>
            <iframe className="pdf-preview" src={pdfUrl} title="Generated PDF preview" />
          </div>
        ) : reviewStep ? (
          <div>
            <SectionTitle title="Confirm Details" intro="Review all entered information before generating the PDF." />
            <Review type={formType} data={data} />
            <div className="confirm-box">
              <strong>Is all information correct?</strong>
              <div className="button-row">
                <button className="secondary-button" type="button" onClick={() => setStep(steps.length - 1)}>Go Back & Edit</button>
                <button className="primary-button" type="button" onClick={generate}>Yes, Confirm & Generate PDF</button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); next(); }}>
            {steps[step].content}
            {errors.length > 0 && <div className="error-panel">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
            <div className="form-nav">
              <button className="secondary-button" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Previous</button>
              <button className="secondary-button" type="button" onClick={() => localStorage.setItem(config.storageKey, JSON.stringify(data))}>Save Draft</button>
              <button className="primary-button" type="submit">{step === steps.length - 1 ? 'Review & Confirm' : 'Next'}</button>
            </div>
          </form>
        )}
      </section>

      <div className="pdf-offscreen" ref={pdfRef}>
        {formType === 'case' ? <CasePdfTemplate data={data} /> : <RozgarPdfTemplate data={data} />}
      </div>
    </main>
  );
}

function updatePath(setData, path, value) {
  setData((current) => setNestedValue(current, path, value));
}

function rozgarSteps(data, setData) {
  return [
    {
      title: 'Applicant Information',
      content: <><SectionTitle title="Applicant Information" urdu="درخواست گزار کی معلومات" /><div className="grid two"><TextInput data={data} setData={setData} path="applicant.date" label="Date" urdu="تاریخ" type="date" /><TextInput data={data} setData={setData} path="applicant.name" label="Name" urdu="نام" required /><TextInput data={data} setData={setData} path="applicant.cnic" label="CNIC" urdu="شناختی کارڈ نمبر" type="cnic" /><TextInput data={data} setData={setData} path="applicant.fatherName" label="Father / Husband name" urdu="والد / شوہر کا نام" /><TextInput data={data} setData={setData} path="applicant.phone" label="Phone number" urdu="فون نمبر" type="tel" /></div></>,
    },
    {
      title: 'Family & Address',
      content: <><SectionTitle title="Family Background & Financial Condition" urdu="خاندانی تفصیلات" /><TextInput data={data} setData={setData} path="familyBackground.details" label="Family background, income sources, issues and need" urdu="خاندان کے ذرائع آمدنی، مشکلات اور ضرورت" multiline /><SectionTitle title="Complete Address" /><div className="grid two"><TextInput data={data} setData={setData} path="address.completeAddress" label="Complete address" urdu="مکمل موجودہ پتہ" /><TextInput data={data} setData={setData} path="address.city" label="City" urdu="تصویر / شہر" /><TextInput data={data} setData={setData} path="address.houseDetails" label="House details" urdu="گھر کی تفصیلات" /><TextInput data={data} setData={setData} path="address.rentAmount" label="Rent amount" urdu="گھر کا کرایہ" type="number" /><TextInput data={data} setData={setData} path="address.electricBill" label="Monthly electricity bill" urdu="ماہانہ بجلی کا بل" type="number" /><TextInput data={data} setData={setData} path="address.transport" label="Transport / vehicle" urdu="کوئی ٹرانسپورٹ / گاڑی" /><TextInput data={data} setData={setData} path="address.householdItems" label="Basic household items" urdu="گھر کے بنیادی اثاثے" /></div></>,
    },
    {
      title: 'Family Information',
      content: <><SectionTitle title="Family Information" urdu="فیملی سلپ" /><div className="grid two"><TextInput data={data} setData={setData} path="familySlip.name" label="Name" urdu="نام" /><TextInput data={data} setData={setData} path="familySlip.cnic" label="CNIC" urdu="شناختی کارڈ نمبر" type="cnic" /><TextInput data={data} setData={setData} path="familySlip.phone" label="Phone number" urdu="فون نمبر" type="tel" /><TextInput data={data} setData={setData} path="familySlip.address" label="Address" urdu="مکمل موجودہ پتہ" /></div><SectionTitle title="Family Members Details" /><FamilyMemberTable type="rozgar" rows={data.familyMembers} onChange={(rows) => updatePath(setData, 'familyMembers', rows)} /><div className="grid two"><TextInput data={data} setData={setData} path="familyTotals.monthlyIncome" label="Total monthly income" urdu="کل ماہانہ آمدنی" type="number" /><TextInput data={data} setData={setData} path="familyTotals.secondSourceSupport" label="Support from second source" urdu="کسی دوسرے ذریعہ سے امداد" /></div></>,
    },
    {
      title: 'Rozgar Specific Information',
      content: <><SectionTitle title="Applicant Skills / Experience" urdu="درخواست گزار کی مہارت یا تجربہ" /><CheckboxGroup label="Skills" values={data.skills.selected} options={skillOptions} onChange={(next) => updatePath(setData, 'skills.selected', next)} /><div className="grid two"><TextInput data={data} setData={setData} path="skills.other" label="Other skill" urdu="دیگر" /><TextInput data={data} setData={setData} path="skills.experienceYears" label="Experience years" urdu="تجربہ سال" type="number" /></div><SectionTitle title="Proposed Rozgar Plan" /><TextInput data={data} setData={setData} path="plan.workToStart" label="What work do they want to start?" urdu="کیا کام شروع کرنا چاہتے ہیں؟" multiline /><div className="grid two"><TextInput data={data} setData={setData} path="plan.equipment" label="Necessary material / machinery" urdu="ضروری سامان / مشینری" /><TextInput data={data} setData={setData} path="plan.estimatedCost" label="Estimated cost" urdu="تخمینی لاگت" type="number" /><TextInput data={data} setData={setData} path="plan.expectedIncome" label="Expected monthly income" urdu="متوقع ماہانہ آمدنی" type="number" /></div></>,
    },
    {
      title: 'Support & Verification',
      content: <><SectionTitle title="Rozgar Support Required" /><CheckboxGroup label="Support required" values={data.support.selected} options={rozgarSupportOptions} onChange={(next) => updatePath(setData, 'support.selected', next)} /><div className="grid two"><TextInput data={data} setData={setData} path="support.other" label="Other support" urdu="دیگر" /><TextInput data={data} setData={setData} path="support.estimatedCost" label="Estimated cost" urdu="تخمینی لاگت" type="number" /></div><SectionTitle title="Future Potential" /><RadioGroup data={data} setData={setData} path="potential.canSelfSustain" label="Can this Rozgar make the family self-sufficient in 3-12 months?" urdu="کیا یہ روزگار 3-12 ماہ میں خاندان کو خود کفیل بنا سکتا ہے؟" options={yesNo} /><TextInput data={data} setData={setData} path="potential.details" label="Details" urdu="تفصیل" multiline /><SectionTitle title="Verification Section" /><div className="grid two"><TextInput data={data} setData={setData} path="verification.chairmanName" label="Chairman name" urdu="چیئرمین کا نام" /><TextInput data={data} setData={setData} path="verification.referredBy" label="Case referred by member" urdu="کیس جس ممبر کے حوالے سے دیا گیا" /><TextInput data={data} setData={setData} path="verification.verificationDate" label="Verification date" urdu="تاریخ تصدیق" type="date" /></div><TextInput data={data} setData={setData} path="verification.teamOpinion" label="Verification team opinion" urdu="تصدیق کرنے والی ٹیم کے ممبر کی رائے" multiline /></>,
    },
    {
      title: 'Attached Documents',
      content: <><SectionTitle title="Attached Documents" urdu="منسلک دستاویزات" /><CheckboxGroup label="Documents" values={data.documents.selected} options={rozgarDocumentOptions} onChange={(next) => updatePath(setData, 'documents.selected', next)} /></>,
    },
  ];
}

function caseSteps(data, setData) {
  return [
    {
      title: 'Applicant Information',
      content: <><SectionTitle title="Applicant Information" urdu="درخواست گزار کی معلومات" /><div className="grid two"><TextInput data={data} setData={setData} path="header.formNumber" label="Form number" urdu="فارم نمبر" /><TextInput data={data} setData={setData} path="header.date" label="Date" urdu="تاریخ" type="date" /><TextInput data={data} setData={setData} path="applicant.familyHeadName" label="Family head name" urdu="خاندان کے سربراہ کا نام" required /><TextInput data={data} setData={setData} path="applicant.guardianName" label="Father / Husband name" urdu="سربراہ کے والد / شوہر کا نام" /><TextInput data={data} setData={setData} path="applicant.cnic" label="CNIC" urdu="شناختی کارڈ نمبر" type="cnic" /><TextInput data={data} setData={setData} path="applicant.phone" label="Phone" urdu="فون نمبر" type="tel" /><TextInput data={data} setData={setData} path="applicant.address" label="Complete address" urdu="مکمل موجودہ پتہ" /><TextInput data={data} setData={setData} path="applicant.city" label="City" urdu="شہر" /></div></>,
    },
    {
      title: 'Family Need & Household',
      content: <><SectionTitle title="Family Need Details" urdu="خاندان کی تفصیلات" intro="Only write the real need and reason for help." /><TextInput data={data} setData={setData} path="familyNeed.details" label="Why does this family need help?" urdu="ہم ان کی مدد کیوں کریں؟" multiline /><SectionTitle title="Household Details" urdu="گھر کی تفصیلات" /><TextInput data={data} setData={setData} path="household.details" label="House size and condition" urdu="کتنے مرلے میں اور حالت کیسی ہے" multiline /><label className="choice standalone"><input type="checkbox" checked={data.household.ownership} onChange={(event) => updatePath(setData, 'household.ownership', event.target.checked)} /> Home owned / گھر ملکیت</label><div className="grid two"><TextInput data={data} setData={setData} path="household.rentAmount" label="Rent amount" urdu="کرایہ" type="number" /><TextInput data={data} setData={setData} path="household.transport" label="Transport / vehicle" urdu="کوئی ٹرانسپورٹ / گاڑی" /><TextInput data={data} setData={setData} path="household.basicItems" label="Basic items" urdu="بنیادی آلات" /><TextInput data={data} setData={setData} path="household.electricBill" label="Monthly electric bill" urdu="بجلی کا بل" type="number" /><TextInput data={data} setData={setData} path="household.hasSeparateElectricMeter" label="Separate electric meter?" urdu="بجلی کا میٹر الگ ہے؟" /><TextInput data={data} setData={setData} path="household.medicineExpense" label="Monthly medicine expense" urdu="ادویات کا خرچ" type="number" /><TextInput data={data} setData={setData} path="household.loanDetails" label="Loan details" urdu="قرضہ" /><TextInput data={data} setData={setData} path="household.illnessDetails" label="Illness details" urdu="بیماری کی تفصیلات" /></div></>,
    },
    {
      title: 'Family Members',
      content: <><SectionTitle title="Family Members Details" urdu="خاندان کے کل افراد کی تفصیلات" /><div className="grid two"><TextInput data={data} setData={setData} path="totals.totalFamilyMembers" label="Total family members" urdu="خاندان کے کل افراد" type="number" /><TextInput data={data} setData={setData} path="totals.childrenCount" label="Children count" urdu="بچوں کی کل تعداد" type="number" /></div><FamilyMemberTable type="case" rows={data.familyMembers} onChange={(rows) => updatePath(setData, 'familyMembers', rows)} /></>,
    },
    {
      title: 'Income, Needs & Documents',
      content: <><SectionTitle title="Income & Needs" /><div className="grid two"><TextInput data={data} setData={setData} path="totals.secondSourceSupport" label="Support from second source" urdu="کسی دوسرے ذریعہ سے امداد" /><TextInput data={data} setData={setData} path="totals.totalIncome" label="Total income" urdu="کل آمدنی" type="number" /></div><CheckboxGroup label="What does the family need?" urdu="خاندان کو کس چیز کی ضرورت ہے؟" values={data.needs.selected} options={caseNeedOptions} onChange={(next) => updatePath(setData, 'needs.selected', next)} /><TextInput data={data} setData={setData} path="appearance.details" label="Describe family appearance in at least two lines" urdu="خاندان کی ظاہری شکل" multiline /><SectionTitle title="Verification Details" /><div className="grid two"><TextInput data={data} setData={setData} path="verification.teamMemberName" label="Team member name" urdu="ٹیم کے ممبر کا نام" /><TextInput data={data} setData={setData} path="verification.referredBy" label="Case referred by" urdu="کیس کس کے حوالے سے دیا گیا" /><TextInput data={data} setData={setData} path="verification.createdBy" label="Case created by" urdu="کیس کرنا" /><TextInput data={data} setData={setData} path="verification.handedTo" label="Handed to" urdu="کس کے حوالے سے دیا گیا" /></div><CheckboxGroup label="Required documents" urdu="لازمی دستاویزات" values={data.documents.selected} options={caseDocumentOptions} onChange={(next) => updatePath(setData, 'documents.selected', next)} /></>,
    },
    {
      title: 'Scoring',
      content: <><SectionTitle title="Check Mark Correct Statement About This Family" /><div className="scoring-grid">{caseScoring.map((item) => <RadioGroup key={item.key} data={data} setData={setData} path={`scoring.${item.key}`} label={`${item.label} (${item.yes}/${item.no} points)`} options={yesNo} />)}</div><div className="score-total">Total Points: {calculateCaseScore(data.scoring, caseScoring)}</div></>,
    },
  ];
}
