'use client';

import { Button } from '@/components';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

interface ExpectedSalaryDisplayProps {
  user: any;
  config: any;
  hraSlabs: any[];
  myAttendance: any[];
  t: any;
  fetchData: () => void;
}

export function ExpectedSalaryDisplay({ user, config, hraSlabs, myAttendance, t, fetchData }: ExpectedSalaryDisplayProps) {
  // Verification path for Zero GET user data
  if (!user || (!user.joiningDate && !user.baseSalary)) {
    return (
      <div className="bg-card border border-border/60 shadow-sm rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
        <p>{t('salary.noUserDataAvailable')}</p>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  // Cast to any for calculation to avoid persistent lint errors on extra fields
  const calculationUser = user as any;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Calculate working days in month (excluding Sundays)
  let workingDaysInMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth - 1, d);
    if (date.getDay() !== 0) workingDaysInMonth++;
  }

  // Get current month attendance from store
  const currentAttendances = myAttendance.filter((att: any) => {
    const d = new Date(att.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  let presentCount = 0;
  let halfCount = 0;
  currentAttendances.forEach((att: any) => {
    if (att.status === 'Present' || att.status === 'Late') presentCount++; // Count Late as Present for attendance days
    if (att.status === 'Half-Day') halfCount++;
  });

  const today = new Date();
  const daysPassed = Math.min(today.getDate(), daysInMonth);

  // Calculate days passed excluding Sundays
  let workingDaysPassed = 0;
  for (let d = 1; d <= daysPassed; d++) {
    const date = new Date(currentYear, currentMonth - 1, d);
    if (date.getDay() !== 0) workingDaysPassed++;
  }

  const absentDays = Math.max(0, workingDaysPassed - presentCount - (halfCount * 0.5));
  const baseSalaryMonthly = ((calculationUser?.baseSalary || 0) / 12);

  // Use workingDaysInMonth for daily rate if config absent
  const deductionPerDay = config?.absentDeductionPerDay || (baseSalaryMonthly / (workingDaysInMonth || 30));
  const absentDeduction = absentDays * deductionPerDay;
  const halfDeduction = halfCount * (deductionPerDay / 2);

  const baseSalaryMonthlyStr = (baseSalaryMonthly || 0).toFixed(2);
  const ta = ((calculationUser?.ta || 0) / 12).toFixed(2);
  const da = (parseFloat(baseSalaryMonthlyStr) * ((config?.daPercentage || 0) / 100)).toFixed(2);

  // HRA Calculation
  let hraVal = 0;
  if (calculationUser?.office && calculationUser?.userType && hraSlabs && hraSlabs.length > 0) {
    const monthlySalary = (calculationUser.baseSalary || 0) / 12;

    const slab = hraSlabs.find((s: any) => {
      const sOfficeId = s.office?._id || s.office;
      const uOfficeId = calculationUser.office?._id || calculationUser.office;
      const sTypeId = s.userType?._id || s.userType;
      const uTypeId = calculationUser.userType?._id || calculationUser.userType;

      const officeMatch = String(sOfficeId || '') === String(uOfficeId || '');
      const typeMatch = String(sTypeId || '') === String(uTypeId || '');

      const min = parseFloat(s.minSalary) || 0;
      const max = parseFloat(s.maxSalary) || 999999999;
      const salaryMatch = monthlySalary >= min && monthlySalary <= max;
      return officeMatch && typeMatch && salaryMatch;
    });

    if (slab) {
      hraVal = monthlySalary * ((slab.hraPercentage || 0) / 100);
    }
  }
  const hra = (hraVal || 0).toFixed(2);

  const ccaValue = (calculationUser?.office && (calculationUser?.baseSalary || 0) < (config?.ccaBaseSalaryLimit || 0)) ? (((typeof calculationUser.office === 'object' ? calculationUser.office.cca : 0) || 0) / 12) : 0;
  const cca = (ccaValue || 0).toFixed(2);

  const oneTimeBonus = (calculationUser?.oneTimeJoiningBonus || 0) / 12;
  const gratuity = (calculationUser?.gratuity || 0) / 12;

  const saTemp = ((calculationUser?.ctc || 0) / 12) - parseFloat(baseSalaryMonthlyStr) - parseFloat(hra) - parseFloat(ta) - parseFloat(da) - oneTimeBonus - gratuity - ccaValue;
  const grossForESI = parseFloat(baseSalaryMonthlyStr) + parseFloat(hra) + parseFloat(da) + parseFloat(ta) + (saTemp || 0);
  const esiThreshold = config?.esiThresholdAmount || 0;
  const esiPercentage = config?.esiPercentage || 0;
  const esi = (grossForESI < esiThreshold) ? ((esiPercentage / 100) * grossForESI).toFixed(2) : '0.00';
  const sa = (saTemp || 0).toFixed(2);
  const pf = (Math.min(((config?.pfPercentage || 12) / 100) * (calculationUser?.baseSalary || 0) / 12, config?.pfCapAmount || 0)).toFixed(2);
  const vpf = (parseFloat(baseSalaryMonthlyStr) * ((calculationUser?.VPF || 0) / 100)).toFixed(2);
  const annualGross = (parseFloat(baseSalaryMonthlyStr) + parseFloat(hra) + parseFloat(da) + parseFloat(ta) + parseFloat(sa)) * 12;

  let annualTax = 0;
  if (annualGross > 1500000) {
    annualTax = (annualGross - 1500000) * 0.3 + 150000 * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
  } else if (annualGross > 1200000) {
    annualTax = (annualGross - 1200000) * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
  } else if (annualGross > 900000) {
    annualTax = (annualGross - 900000) * 0.15 + 300000 * 0.1 + 300000 * 0.05;
  } else if (annualGross > 600000) {
    annualTax = (annualGross - 600000) * 0.1 + 300000 * 0.05;
  } else if (annualGross > 300000) {
    annualTax = (annualGross - 300000) * 0.05;
  }
  const incomeTax = (annualTax / 12).toFixed(2);
  const cess = (parseFloat(incomeTax) * 0.04).toFixed(2);
  const professionalTax = ((calculationUser?.baseSalary || 0) > (config?.professionalTaxThreshold || 0)) ? (config?.professionalTaxAmount || 0).toFixed(2) : '0.00';
  const totalEarnings = parseFloat(baseSalaryMonthlyStr) + parseFloat(ta) + parseFloat(da) + parseFloat(hra) + parseFloat(cca) + parseFloat(sa);
  const totalDeductions = parseFloat(pf) + parseFloat(vpf) + parseFloat(esi) + parseFloat(incomeTax) + parseFloat(cess) + parseFloat(professionalTax) + absentDeduction + halfDeduction;
  const expectedNet = (totalEarnings - totalDeductions).toFixed(2);

  return (
    <div className="bg-card border border-border/60 shadow-sm rounded-xl p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-4 md:mb-6 lg:mb-8 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <BarChart3 className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="text-lg xs:text-xl font-semibold text-foreground">
          {t('salary.expectedSalary')}
        </h2>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.baseSalary')}</span>
          <span className="text-secondary font-medium">₹{baseSalaryMonthlyStr}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.ta')}</span>
          <span className="text-secondary font-medium">+₹{ta}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.da')}</span>
          <span className="text-secondary font-medium">+₹{da}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.hra')}</span>
          <span className="text-secondary font-medium">+₹{hra}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.cca')}</span>
          <span className="text-secondary font-medium">+₹{cca}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.sa')}</span>
          <span className="text-secondary font-medium">+₹{sa}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.esi')}</span>
          <span className="text-destructive font-medium">-₹{esi}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.pf')}</span>
          <span className="text-destructive font-medium">-₹{pf}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.vpf')}</span>
          <span className="text-destructive font-medium">-₹{vpf}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.incomeTax')}</span>
          <span className="text-destructive font-medium">-₹{incomeTax}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.cess')}</span>
          <span className="text-destructive font-medium">-₹{cess}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.professionalTax')}</span>
          <span className="text-destructive font-medium">-₹{professionalTax}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.absentDeductions')}</span>
          <span className="text-destructive font-medium">-₹{absentDeduction.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">{t('salary.halfDayDeductions')}</span>
          <span className="text-destructive font-medium">-₹{halfDeduction.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-border pt-3">
          <span className="text-foreground font-semibold">{t('salary.netSalary')}</span>
          <span className="text-secondary font-bold text-lg">₹{expectedNet}</span>
        </div>
        <p className="text-muted-foreground text-sm mt-4 italic">{t('salary.estimateNoteWithAttendance')}</p>
      </div>
    </div>
  );
}
