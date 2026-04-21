import { SalarySlipClient } from '@/components/dashboard/reports/slip/SalarySlipClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salary Slip | Office Management System',
  description: 'View and download official salary slip',
};

export default function SalarySlipPage() {
  return <SalarySlipClient />;
}