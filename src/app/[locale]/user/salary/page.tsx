import { SalaryClient } from '@/components/user/salary/SalaryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salary | Office Management System',
  description: 'View your salary details and projections',
};

export default function UserSalaryPage() {
  return <SalaryClient />;
}
