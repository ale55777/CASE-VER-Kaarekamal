import { jsPDF } from 'jspdf';
import { caseDocumentOptions, caseNeedOptions, caseScoring, rozgarDocumentOptions, rozgarSupportOptions, skillOptions } from '../data/forms.js';
import { calculateCaseScore } from '../utils/formUtils.js';
import { appendImageAttachments } from './attachments.js';

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 42;
const contentWidth = pageWidth - margin * 2;
const colors = { primary: [15, 95, 131], dark: [23, 32, 38], muted: [102, 114, 125], light: [233, 244, 248], line: [216, 224, 231], accent: [231, 121, 43] };
const urduLabelText = {
  'Applicant Details': 'درخواست گزار کی معلومات',
  'Family & Household Details': 'خاندان اور گھرانے کی تفصیلات',
  'Family Slip & Members': 'فیملی سلپ اور افراد',
  'Skills & Proposed Rozgar Plan': 'مہارتیں اور مجوزہ روزگار منصوبہ',
  'Needs / Support Requested': 'ضروریات / مطلوبہ مدد',
  'Potential & Verification': 'صلاحیت اور تصدیق',
  'Attached Documents': 'منسلک دستاویزات',
  'Family Need & Household Details': 'خاندانی ضرورت اور گھرانے کی تفصیلات',
  'Family Members': 'خاندان کے افراد',
  'Verification & Attached Documents': 'تصدیق اور منسلک دستاویزات',
  'Verification Scoring': 'تصدیقی اسکورنگ',
  'Date': 'تاریخ',
  'Name': 'نام',
  'CNIC': 'شناختی کارڈ نمبر',
  'Father / Husband': 'والد / شوہر',
  'Phone': 'فون',
  'Complete address': 'مکمل موجودہ پتہ',
  'City': 'شہر',
  'Family background, income sources, issues and need': 'خاندانی پس منظر، آمدنی کے ذرائع، مسائل اور ضرورت',
  'House details': 'گھر کی تفصیلات',
  'Rent amount': 'گھر کا کرایہ',
  'Electricity bill': 'بجلی کا بل',
  'Transport / vehicle': 'ٹرانسپورٹ / گاڑی',
  'Basic household items': 'گھر کے بنیادی اثاثے',
  'Slip name': 'سلپ پر نام',
  'Slip CNIC': 'سلپ شناختی کارڈ',
  'Slip phone': 'سلپ فون',
  'Slip address': 'سلپ کا پتہ',
  'Total monthly income': 'کل ماہانہ آمدنی',
  'Second source support': 'دوسرے ذریعہ سے مدد',
  'Skills': 'مہارتیں',
  'Experience years': 'تجربے کے سال',
  'Other skill': 'دیگر مہارت',
  'Work to start': 'شروع کیا جانے والا کام',
  'Necessary material / machinery': 'ضروری سامان / مشینری',
  'Estimated cost': 'تخمینی لاگت',
  'Expected monthly income': 'متوقع ماہانہ آمدنی',
  'Other support': 'دیگر مدد',
  'Estimated support cost': 'مدد کی تخمینی لاگت',
  'Can applicant self-sustain?': 'کیا درخواست گزار خود کفیل ہو سکتا ہے؟',
  'Verification date': 'تصدیق کی تاریخ',
  'Future potential details': 'مستقبل کی صلاحیت کی تفصیلات',
  'Chairman / verifier': 'چیئرمین / تصدیق کنندہ',
  'Referred by': 'حوالہ دینے والا',
  'Team opinion': 'ٹیم کی رائے',
  'Signature': 'دستخط',
  'Form number': 'فارم نمبر',
  'Family head': 'خاندان کا سربراہ',
  'Guardian': 'والد / سرپرست',
  'Family need details': 'خاندان کی ضرورت کی تفصیلات',
  'Ownership': 'ملکیت',
  'Separate electric meter': 'الگ بجلی کا میٹر',
  'Medicine expense': 'ادویات کا خرچ',
  'Loan details': 'قرضے کی تفصیلات',
  'Illness details': 'بیماری کی تفصیلات',
  'Total family members': 'خاندان کے کل افراد',
  'Children count': 'بچوں کی تعداد',
  'Total income': 'کل آمدنی',
  'Family appearance': 'خاندان کی ظاہری حالت',
  'Team member': 'ٹیم ممبر',
  'Created by': 'تیار کرنے والا',
  'Handed to': 'حوالے کیا گیا',
  'Question': 'سوال',
  'Answer': 'جواب',
  'Points': 'نمبر',
  'Total points': 'کل نمبر',
  'Age': 'عمر',
  'Education / Institute': 'تعلیم / ادارہ',
  'Occupation': 'پیشہ',
  'Income': 'آمدنی',
  'Class': 'جماعت',
  'Income / Fees': 'آمدنی / فیس',
  'Education / Source': 'تعلیم / ذریعہ',
};

function value(input) {
  if (input === null || input === undefined || input === '') return 'Not provided';
  return String(input);
}

function labels(options, selected) {
  const selectedValues = selected || [];
  return options.filter((option) => selectedValues.includes(option.value)).map((option) => option.label.split(' / ')[0]).join(', ') || 'None selected';
}

async function loadLogo() {
  try {
    const response = await fetch('/reference/image header.jpg');
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function createUrduLabelImages() {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 54;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.direction = 'rtl';
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.fillStyle = '#66727d';
  context.font = 'bold 28px Tahoma, "Noto Naskh Arabic", "Segoe UI", sans-serif';
  return Object.fromEntries(Object.entries(urduLabelText).map(([english, urdu]) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(urdu, canvas.width - 5, canvas.height / 2);
    return [english, canvas.toDataURL('image/png')];
  }));
}

function createRenderer(pdf, logo, formName, urduLabels) {
  let y = 0;
  let pageNumber = 0;

  const addPage = () => {
    if (pageNumber > 0) pdf.addPage([pageWidth, pageHeight], 'portrait');
    pageNumber += 1;
    y = 36;
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, pageWidth, 7, 'F');
    if (logo) {
      const watermarkState = pdf.GState ? new pdf.GState({ opacity: 0.07 }) : null;
      if (watermarkState) pdf.setGState(watermarkState);
      pdf.addImage(logo, 'JPEG', (pageWidth - 210) / 2, 280, 210, 210);
      if (watermarkState) pdf.setGState(new pdf.GState({ opacity: 1 }));
    }
    if (logo) pdf.addImage(logo, 'JPEG', margin, 17, 36, 36);
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text('Kaar-e-Kamal Welfare Foundation', margin + 46, 31);
    pdf.setTextColor(...colors.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(formName, margin + 46, 43);
    y = 70;
  };

  const ensure = (height) => {
    if (y + height > pageHeight - 42) addPage();
  };

  const section = (title) => {
    ensure(34);
    pdf.setFillColor(...colors.light);
    pdf.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
    pdf.setTextColor(...colors.primary);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(title, margin + 10, y + 16);
    if (urduLabels[title]) pdf.addImage(urduLabels[title], 'PNG', pageWidth - margin - 132, y + 5, 122, 13);
    y += 32;
  };

  const field = (label, input, x, width, options = {}) => {
    const text = value(input);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(options.size || 9);
    const lines = pdf.splitTextToSize(text, width - 12);
    const height = Math.max(options.minHeight || 27, lines.length * 12 + 17);
    ensure(height + 4);
    pdf.setTextColor(...colors.muted);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(label.toUpperCase(), x + 6, y + 10);
    if (urduLabels[label]) pdf.addImage(urduLabels[label], 'PNG', x + width - 96, y + 3, 88, 10);
    pdf.setTextColor(...colors.dark);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(options.size || 9);
    pdf.text(lines, x + 6, y + 21, { maxWidth: width - 12 });
    pdf.setDrawColor(...colors.line);
    pdf.roundedRect(x, y, width, height, 2, 2, 'S');
    return height;
  };

  const row = (fields) => {
    const gap = 8;
    const widths = fields.map((item) => item.width || (contentWidth - gap * (fields.length - 1)) / fields.length);
    const height = Math.max(...fields.map((item) => Math.max(27, pdf.splitTextToSize(value(item.input), widths[fields.indexOf(item)] - 12).length * 12 + 17)));
    ensure(height + 4);
    let x = margin;
    fields.forEach((item, index) => {
      field(item.label, item.input, x, widths[index], { minHeight: height });
      x += widths[index] + gap;
    });
    y += height + 8;
  };

  const paragraph = (label, input) => {
    const lines = pdf.splitTextToSize(value(input), contentWidth - 14);
    const height = Math.max(44, lines.length * 12 + 25);
    ensure(height + 4);
    pdf.setTextColor(...colors.muted);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(label.toUpperCase(), margin + 7, y + 11);
    if (urduLabels[label]) pdf.addImage(urduLabels[label], 'PNG', margin + contentWidth - 104, y + 4, 96, 11);
    pdf.setTextColor(...colors.dark);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(lines, margin + 7, y + 23, { maxWidth: contentWidth - 14 });
    pdf.setDrawColor(...colors.line);
    pdf.roundedRect(margin, y, contentWidth, height, 2, 2, 'S');
    y += height + 8;
  };

  const table = (headers, rows) => {
    const widths = headers.map((header, index) => index === 0 ? 92 : (contentWidth - 92) / (headers.length - 1));
    const rowHeight = 24;
    ensure(rowHeight * (rows.length + 1) + 8);
    let x = margin;
    pdf.setFillColor(...colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    headers.forEach((header, index) => {
      pdf.rect(x, y, widths[index], rowHeight, 'F');
      pdf.text(header, x + 5, y + 15, { maxWidth: widths[index] - 10 });
      if (urduLabels[header]) pdf.addImage(urduLabels[header], 'PNG', x + widths[index] - Math.min(52, widths[index] - 8), y + 5, Math.min(46, widths[index] - 12), 9);
      x += widths[index];
    });
    y += rowHeight;
    rows.forEach((entry) => {
      ensure(rowHeight + 4);
      x = margin;
      pdf.setTextColor(...colors.dark);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      entry.forEach((cell, index) => {
        pdf.setDrawColor(...colors.line);
        pdf.rect(x, y, widths[index], rowHeight, 'S');
        pdf.text(value(cell), x + 5, y + 15, { maxWidth: widths[index] - 10 });
        x += widths[index];
      });
      y += rowHeight;
    });
    y += 8;
  };

  const checklist = (title, options, selected) => {
    section(title);
    const selectedValues = selected || [];
    options.forEach((option) => {
      ensure(19);
      const checked = selectedValues.includes(option.value);
      pdf.setDrawColor(...colors.line);
      pdf.rect(margin + 5, y + 2, 10, 10, 'S');
      if (checked) {
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(1.5);
        pdf.line(margin + 7, y + 7, margin + 10, y + 10);
        pdf.line(margin + 10, y + 10, margin + 14, y + 4);
        pdf.setLineWidth(0.2);
      }
      pdf.setTextColor(...colors.dark);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.text(option.label.split(' / ')[0], margin + 23, y + 10);
      y += 17;
    });
    y += 4;
  };

  const footer = () => {
    pdf.setTextColor(...colors.muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(`Generated by Kaar-e-Kamal Welfare Foundation • Page ${pageNumber}`, margin, pageHeight - 20);
  };

  return { addPage, section, row, paragraph, table, checklist, footer, getPageNumber: () => pageNumber };
}

function finishPages(pdf, renderer) {
  for (let page = 1; page <= renderer.getPageNumber(); page += 1) {
    pdf.setPage(page);
    renderer.footer();
  }
  return pdf;
}

async function buildRozgar(pdf, data, logo, urduLabels) {
  const render = createRenderer(pdf, logo, 'Rozgar Verification Form', urduLabels);
  render.addPage();
  render.section('Applicant Details');
  render.row([{ label: 'Date', input: data.applicant.date }, { label: 'Name', input: data.applicant.name }]);
  render.row([{ label: 'CNIC', input: data.applicant.cnic }, { label: 'Father / Husband', input: data.applicant.fatherName }, { label: 'Phone', input: data.applicant.phone }]);
  render.section('Family & Household Details');
  render.paragraph('Family background, income sources, issues and need', data.familyBackground.details);
  render.row([{ label: 'Complete address', input: data.address.completeAddress, width: contentWidth * 0.68 }, { label: 'City', input: data.address.city, width: contentWidth * 0.32 - 8 }]);
  render.row([{ label: 'House details', input: data.address.houseDetails }, { label: 'Rent amount', input: data.address.rentAmount }, { label: 'Electricity bill', input: data.address.electricBill }]);
  render.row([{ label: 'Transport / vehicle', input: data.address.transport }, { label: 'Basic household items', input: data.address.householdItems }]);
  render.section('Family Slip & Members');
  render.row([{ label: 'Slip name', input: data.familySlip.name }, { label: 'Slip CNIC', input: data.familySlip.cnic }, { label: 'Slip phone', input: data.familySlip.phone }]);
  render.paragraph('Slip address', data.familySlip.address);
  const members = data.familyMembers.filter((row) => Object.values(row).some(Boolean));
  render.table(['Name', 'Age', 'Education / Institute', 'Occupation', 'Income'], members.length ? members.map((member) => [member.name, member.age, member.educationOrInstitute, member.occupation, member.income]) : [['Not provided', '', '', '', '']]);
  render.row([{ label: 'Total monthly income', input: data.familyTotals.monthlyIncome }, { label: 'Second source support', input: data.familyTotals.secondSourceSupport }]);
  render.section('Skills & Proposed Rozgar Plan');
  render.row([{ label: 'Skills', input: labels(skillOptions, data.skills.selected), width: contentWidth * 0.68 }, { label: 'Experience years', input: data.skills.experienceYears, width: contentWidth * 0.32 - 8 }]);
  render.row([{ label: 'Other skill', input: data.skills.other }, { label: 'Work to start', input: data.plan.workToStart }]);
  render.paragraph('Necessary material / machinery', data.plan.equipment);
  render.row([{ label: 'Estimated cost', input: data.plan.estimatedCost }, { label: 'Expected monthly income', input: data.plan.expectedIncome }]);
  render.checklist('Needs / Support Requested', rozgarSupportOptions, data.support.selected);
  render.row([{ label: 'Other support', input: data.support.other }, { label: 'Estimated support cost', input: data.support.estimatedCost }]);
  render.section('Potential & Verification');
  render.row([{ label: 'Can applicant self-sustain?', input: data.potential.canSelfSustain }, { label: 'Verification date', input: data.verification.verificationDate }]);
  render.paragraph('Future potential details', data.potential.details);
  render.row([{ label: 'Chairman / verifier', input: data.verification.chairmanName }, { label: 'Referred by', input: data.verification.referredBy }]);
  render.paragraph('Team opinion', data.verification.teamOpinion);
  render.checklist('Attached Documents', rozgarDocumentOptions, data.documents.selected);
  render.row([{ label: 'Signature', input: '____________________________' }, { label: 'Date', input: data.verification.verificationDate }]);
  return finishPages(pdf, render);
}

async function buildCase(pdf, data, logo, urduLabels) {
  const render = createRenderer(pdf, logo, 'Case Verification Form', urduLabels);
  render.addPage();
  render.section('Applicant Details');
  render.row([{ label: 'Form number', input: data.header.formNumber }, { label: 'Date', input: data.header.date }]);
  render.row([{ label: 'Family head', input: data.applicant.familyHeadName }, { label: 'Guardian', input: data.applicant.guardianName }]);
  render.row([{ label: 'CNIC', input: data.applicant.cnic }, { label: 'Phone', input: data.applicant.phone }, { label: 'City', input: data.applicant.city }]);
  render.paragraph('Complete address', data.applicant.address);
  render.section('Family Need & Household Details');
  render.paragraph('Family need details', data.familyNeed.details);
  render.row([{ label: 'House details', input: data.household.details }, { label: 'Ownership', input: data.household.ownership ? 'Owned' : 'Rented / not specified' }]);
  render.row([{ label: 'Rent amount', input: data.household.rentAmount }, { label: 'Transport', input: data.household.transport }, { label: 'Basic items', input: data.household.basicItems }]);
  render.row([{ label: 'Electricity bill', input: data.household.electricBill }, { label: 'Separate electric meter', input: data.household.hasSeparateElectricMeter }, { label: 'Medicine expense', input: data.household.medicineExpense }]);
  render.row([{ label: 'Loan details', input: data.household.loanDetails }, { label: 'Illness details', input: data.household.illnessDetails }]);
  render.section('Family Members');
  render.row([{ label: 'Total family members', input: data.totals.totalFamilyMembers }, { label: 'Children count', input: data.totals.childrenCount }]);
  const members = data.familyMembers.filter((row) => Object.values(row).some(Boolean));
  render.table(['Class', 'Income / Fees', 'Education / Source', 'Age', 'Name'], members.length ? members.map((member) => [member.className, member.incomeOrFees, member.incomeSourceOrEducation, member.age, member.name]) : [['Not provided', '', '', '', '']]);
  render.row([{ label: 'Total income', input: data.totals.totalIncome }, { label: 'Second source support', input: data.totals.secondSourceSupport }]);
  render.checklist('Needs / Support Required', caseNeedOptions, data.needs.selected);
  render.paragraph('Family appearance', data.appearance.details);
  render.section('Verification & Attached Documents');
  render.row([{ label: 'Team member', input: data.verification.teamMemberName }, { label: 'Referred by', input: data.verification.referredBy }]);
  render.row([{ label: 'Created by', input: data.verification.createdBy }, { label: 'Handed to', input: data.verification.handedTo }]);
  render.checklist('Attached Documents', caseDocumentOptions, data.documents.selected);
  render.section('Verification Scoring');
  render.table(['Question', 'Answer', 'Points'], caseScoring.map((item) => [item.label, data.scoring[item.key] || 'Not answered', data.scoring[item.key] === 'yes' ? item.yes : data.scoring[item.key] === 'no' ? item.no : 0]));
  render.row([{ label: 'Total points', input: calculateCaseScore(data.scoring, caseScoring) }, { label: 'Signature', input: '____________________________' }]);
  return finishPages(pdf, render);
}

export async function generateCleanPdf(formType, data) {
  const logo = await loadLogo();
  const urduLabels = createUrduLabelImages();
  const pdf = new jsPDF({ unit: 'pt', format: [pageWidth, pageHeight], orientation: 'portrait' });
  const generated = formType === 'case' ? await buildCase(pdf, data, logo, urduLabels) : await buildRozgar(pdf, data, logo, urduLabels);
  return appendImageAttachments(generated, data.attachments);
}
