import { SettingsClient } from '@/components/dashboard/settings/SettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Office Management System',
  description: 'Manage your personal preferences',
};

export default function SettingsPage() {
  return <SettingsClient />;
}