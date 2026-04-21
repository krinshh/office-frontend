'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Check from 'lucide-react/dist/esm/icons/check';
import FormField from '@/components/FormField';
import Textarea from '@/components/Textarea';
import Button from '@/components/Button';
import { PERMISSIONS } from '@/constants/permissions';
import { VALID_REGEX } from '@/constants/regex';

interface UserTypeModalContentProps {
  editingUserType: any;
  onSubmit: (data: { name: string; description: string; permissions: string[] }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  errors: Record<string, string>;
}

export const UserTypeModalContent = ({
  editingUserType,
  onSubmit,
  onCancel,
  submitting,
  errors
}: UserTypeModalContentProps) => {
  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: editingUserType?.name || '',
    description: editingUserType?.description || '',
    permissions: editingUserType?.permissions || [] as string[],
  });

  const handlePermissionToggle = (perm: string) => {
    setFormData(prev => {
      const isSelected = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((p: string) => p !== perm)
          : [...prev.permissions, perm]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <FormField
        name="roleName"
        label={t('users.form.roleName')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />
      <Textarea
        name="roleDescription"
        label={t('users.form.description')}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        required
      />

      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground block mb-1.5">
          {t('users.form.permissions') || 'Permissions'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto no-scrollbar border border-border/60 p-3 rounded-lg bg-muted/5">
          {Object.values(PERMISSIONS).filter(p => p !== 'all').map((perm) => (
            <div
              key={perm}
              onClick={() => handlePermissionToggle(perm)}
              className={`flex items-center gap-3 p-2 rounded-md border transition-all duration-200 cursor-pointer ${formData.permissions.includes(perm) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border hover:border-primary/30'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(perm) ? 'bg-primary border-primary' : 'border border-border'}`}>
                {formData.permissions.includes(perm) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">{perm.replace(VALID_REGEX.UNDERSCORE, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 md:gap-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {t('users.cancel')}
        </Button>
        <Button
          type="submit"
          loading={submitting}
        >
          {editingUserType ? (t('users.updateUserType') || 'Update Role') : (t('users.createUserType') || 'Create Role')}
        </Button>
      </div>
    </form>
  );
};
