export const skillOptions = [
  { value: 'tailoring', label: 'Tailoring / سلائی' },
  { value: 'driver', label: 'Driver / ڈرائیور' },
  { value: 'electrician', label: 'Electrician / الیکٹریشن' },
  { value: 'shopkeeper', label: 'Shopkeeper / دکاندار' },
  { value: 'mechanic', label: 'Mechanic / مکینک' },
  { value: 'laborer', label: 'Laborer / مزدور' },
  { value: 'other', label: 'Other / دیگر' },
];

export const rozgarSupportOptions = [
  { value: 'tools', label: 'Tools / Machinery / ٹولز / مشینری' },
  { value: 'shopItems', label: 'Small shop items / چھوٹی دکان کا سامان' },
  { value: 'rickshaw', label: 'Rickshaw / Loader / رکشہ / لوڈر' },
  { value: 'sewingMachine', label: 'Sewing machine / سلائی مشین' },
  { value: 'other', label: 'Other / دیگر' },
];

export const rozgarDocumentOptions = [
  { value: 'cnic', label: 'CNIC copy / شناختی کارڈ کی کاپی' },
  { value: 'electricBill', label: 'Last month electricity bill / آخری ماہ کا بجلی بل' },
  { value: 'rentAgreement', label: 'Rent agreement, if any / کرایہ نامہ' },
  { value: 'bform', label: "Children's B-Form / بچوں کے B-Form" },
  { value: 'skillProof', label: 'Skill or experience proof / مہارت یا تجربہ کا ثبوت' },
  { value: 'businessPlan', label: 'Business plan or item list / کاروباری پلان یا سامان کی لسٹ' },
];

export const caseNeedOptions = [
  { value: 'ration', label: 'Ration / راشن' },
  { value: 'medicine', label: 'Medicine / ادویات' },
  { value: 'fees', label: 'Fees / فیس' },
  { value: 'rozgar', label: 'Rozgar / روزگار' },
];

export const caseDocumentOptions = [
  { value: 'cnic', label: 'CNIC copy / شناختی کارڈ کی کاپی' },
  { value: 'rentAgreement', label: 'Rent agreement copy / کرایہ کے معاہدے کی کاپی' },
  { value: 'deathCertificate', label: "Husband's death certificate / شوہر کے ڈیتھ سرٹیفکیٹ کی کاپی" },
  { value: 'electricBill', label: 'Last month electricity bill / آخری ماہ کے بجلی بل کی کاپی' },
  { value: 'feeBill', label: "Children's fee bill / بچوں کے فیس بل کی کاپی" },
  { value: 'familyForm', label: 'Family form or birth certificate / خاندان کے فارم یا برتھ سرٹیفکیٹ کی کاپی' },
  { value: 'medicalReports', label: 'Recent medical reports / تازہ ترین میڈیکل رپورٹس کی کاپی' },
];

export const caseScoring = [
  { key: 'incomeUnder25', label: 'Monthly Income (Less Than 25K)', yes: 10, no: 5 },
  { key: 'homeRented', label: 'Home (Rented)', yes: 10, no: 0 },
  { key: 'rentUnder12', label: 'Rent (Less Than 12K)', yes: 10, no: 5 },
  { key: 'widowDisabledOrphan', label: 'Widow/Disabled/Orphan', yes: 15, no: 5 },
  { key: 'debt', label: 'Debt (Qarza)', yes: 5, no: 0 },
  { key: 'familyOver5', label: 'Family Members (More than 5)', yes: 10, no: 5 },
  { key: 'noOneEarning', label: 'No one Earning in Family', yes: 5, no: 2 },
  { key: 'itemsInHome', label: 'Items in Home (Fridge, Cooler, Bike, Furniture)', yes: 2, no: 10 },
  { key: 'medicalIssues', label: 'Medical Issues', yes: 10, no: 0 },
  { key: 'kidsEducationOver3', label: 'Kids Getting Education (More Than 3)', yes: 10, no: 5 },
  { key: 'otherSupport', label: 'Others Support (Family/Relatives)', yes: 2, no: 5 },
  { key: 'electricBillUnder5', label: 'Monthly Avg Electricity Bill (Less than 5K)', yes: 10, no: 5 },
];

export const initialRozgarData = {
  applicant: { date: '', name: '', cnic: '', fatherName: '', phone: '' },
  familyBackground: { details: '' },
  address: {
    completeAddress: '',
    city: '',
    houseDetails: '',
    rentAmount: '',
    electricBill: '',
    transport: '',
    householdItems: '',
  },
  familySlip: { name: '', cnic: '', phone: '', address: '' },
  familyMembers: [{ name: '', age: '', educationOrInstitute: '', occupation: '', income: '' }],
  familyTotals: { monthlyIncome: '', secondSourceSupport: '' },
  skills: { selected: [], other: '', experienceYears: '' },
  plan: { workToStart: '', equipment: '', estimatedCost: '', expectedIncome: '' },
  support: { selected: [], other: '', estimatedCost: '' },
  potential: { canSelfSustain: '', details: '' },
  verification: { chairmanName: '', referredBy: '', teamOpinion: '', verificationDate: '' },
  documents: { selected: [] },
};

export const initialCaseData = {
  header: { formNumber: '', date: '' },
  applicant: {
    familyHeadName: '',
    guardianName: '',
    cnic: '',
    phone: '',
    address: '',
    city: '',
  },
  familyNeed: { details: '' },
  household: {
    details: '',
    ownership: false,
    rentAmount: '',
    transport: '',
    basicItems: '',
    electricBill: '',
    hasSeparateElectricMeter: '',
    medicineExpense: '',
    loanDetails: '',
    illnessDetails: '',
  },
  familyMembers: [{ name: '', age: '', incomeSourceOrEducation: '', incomeOrFees: '', className: '' }],
  totals: { totalFamilyMembers: '', childrenCount: '', totalIncome: '', secondSourceSupport: '' },
  needs: { selected: [] },
  appearance: { details: '' },
  verification: { teamMemberName: '', referredBy: '', createdBy: '', handedTo: '' },
  documents: { selected: [] },
  scoring: Object.fromEntries(caseScoring.map((item) => [item.key, ''])),
};

export const formConfigs = {
  rozgar: {
    type: 'rozgar',
    title: 'Rozgar Verification',
    subtitle: 'Rozgar Case Verification Form',
    storageKey: 'kk-rozgar-draft',
    initialData: initialRozgarData,
  },
  case: {
    type: 'case',
    title: 'Case Verification',
    subtitle: 'Case Verification Form',
    storageKey: 'kk-case-draft',
    initialData: initialCaseData,
  },
};
