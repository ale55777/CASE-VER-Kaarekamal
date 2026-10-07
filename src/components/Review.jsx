import { caseDocumentOptions, caseNeedOptions, caseScoring, rozgarDocumentOptions, rozgarSupportOptions, skillOptions } from '../data/forms.js';
import { calculateCaseScore } from '../utils/formUtils.js';

function optionLabels(options, selected) {
  return options.filter((option) => selected?.includes(option.value)).map((option) => option.label).join(', ') || 'Not selected';
}

function Block({ title, entries }) {
  return (
    <section className="review-block">
      <h3>{title}</h3>
      <dl>
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd dir="auto">{value || 'Not provided'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Review({ type, data }) {
  if (type === 'case') {
    return (
      <div className="review-grid">
        <Block title="Applicant Information" entries={[
          ['Form number', data.header.formNumber],
          ['Date', data.header.date],
          ['Family head', data.applicant.familyHeadName],
          ['Guardian', data.applicant.guardianName],
          ['CNIC', data.applicant.cnic],
          ['Phone', data.applicant.phone],
          ['Address', data.applicant.address],
          ['City', data.applicant.city],
        ]} />
        <Block title="Family Need & Household" entries={[
          ['Need details', data.familyNeed.details],
          ['House details', data.household.details],
          ['Rent amount', data.household.rentAmount],
          ['Transport', data.household.transport],
          ['Basic items', data.household.basicItems],
          ['Electric bill', data.household.electricBill],
          ['Medicine expense', data.household.medicineExpense],
          ['Loan details', data.household.loanDetails],
          ['Illness details', data.household.illnessDetails],
        ]} />
        <Block title="Family Members" entries={data.familyMembers.map((m, i) => [`Member ${i + 1}`, `${m.name} ${m.age} ${m.incomeSourceOrEducation} ${m.incomeOrFees} ${m.className}`])} />
        <Block title="Verification" entries={[
          ['Total family members', data.totals.totalFamilyMembers],
          ['Children count', data.totals.childrenCount],
          ['Total income', data.totals.totalIncome],
          ['Second source support', data.totals.secondSourceSupport],
          ['Needs', optionLabels(caseNeedOptions, data.needs.selected)],
          ['Appearance details', data.appearance.details],
          ['Team member', data.verification.teamMemberName],
          ['Referred by', data.verification.referredBy],
          ['Created by', data.verification.createdBy],
          ['Handed to', data.verification.handedTo],
          ['Documents', optionLabels(caseDocumentOptions, data.documents.selected)],
          ['Total points', calculateCaseScore(data.scoring, caseScoring)],
        ]} />
      </div>
    );
  }

  return (
    <div className="review-grid">
      <Block title="Applicant Information" entries={[
        ['Date', data.applicant.date],
        ['Name', data.applicant.name],
        ['CNIC', data.applicant.cnic],
        ['Father/Husband', data.applicant.fatherName],
        ['Phone', data.applicant.phone],
      ]} />
      <Block title="Family & Address" entries={[
        ['Family background', data.familyBackground.details],
        ['Address', data.address.completeAddress],
        ['City', data.address.city],
        ['House details', data.address.houseDetails],
        ['Rent amount', data.address.rentAmount],
        ['Electric bill', data.address.electricBill],
        ['Transport', data.address.transport],
        ['Household items', data.address.householdItems],
      ]} />
      <Block title="Family Slip & Members" entries={[
        ['Slip name', data.familySlip.name],
        ['Slip CNIC', data.familySlip.cnic],
        ['Slip phone', data.familySlip.phone],
        ['Slip address', data.familySlip.address],
        ...data.familyMembers.map((m, i) => [`Member ${i + 1}`, `${m.name} ${m.age} ${m.educationOrInstitute} ${m.occupation} ${m.income}`]),
      ]} />
      <Block title="Rozgar Information" entries={[
        ['Skills', optionLabels(skillOptions, data.skills.selected)],
        ['Other skill', data.skills.other],
        ['Experience years', data.skills.experienceYears],
        ['Work to start', data.plan.workToStart],
        ['Equipment', data.plan.equipment],
        ['Estimated cost', data.plan.estimatedCost],
        ['Expected income', data.plan.expectedIncome],
        ['Support required', optionLabels(rozgarSupportOptions, data.support.selected)],
        ['Future potential', data.potential.canSelfSustain],
        ['Potential details', data.potential.details],
        ['Team opinion', data.verification.teamOpinion],
        ['Documents', optionLabels(rozgarDocumentOptions, data.documents.selected)],
      ]} />
    </div>
  );
}
