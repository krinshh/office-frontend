'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Select from '@/components/Select';
import FormField from '@/components/FormField';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';

interface ConfigSlabModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSlab: any;
  setNewSlab: (slab: any) => void;
  offices: any[];
  userTypes: any[];
  onSubmit: (e: any) => void;
  loading: boolean;
  errors: Record<string, string>;
}

export const ConfigSlabModal = ({
  isOpen,
  onClose,
  newSlab,
  setNewSlab,
  offices,
  userTypes,
  onSubmit,
  loading,
  errors
}: ConfigSlabModalProps) => {
  const t = useTranslations();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('globalConfig.hraSlab.addNewSlabTitle')}
      t={t}
    >
      <form onSubmit={onSubmit} className="space-y-4 md:space-y-6" autoComplete="off">
        {errors.global && <Alert type="error" message={errors.global} className="mb-4" t={t} />}

        <Select
          label={t('globalConfig.hraSlab.office')}
          value={newSlab.office}
          onChange={(e) => setNewSlab({ ...newSlab, office: e.target.value })}
          options={offices.map(o => ({ value: o._id, label: o.name }))}
          placeholder={t('globalConfig.hraSlab.selectOffice')}
          required
        />

        <Select
          label={t('globalConfig.hraSlab.userType')}
          value={newSlab.userType}
          onChange={(e) => setNewSlab({ ...newSlab, userType: e.target.value })}
          options={userTypes.map(t => ({ value: t._id, label: t.name }))}
          placeholder={t('globalConfig.hraSlab.selectUserType')}
          required
        />

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <FormField
            name="minSalary"
            label={t('globalConfig.hraSlab.minimumSalary')}
            type="number"
            value={newSlab.minSalary}
            onChange={(e) => setNewSlab({ ...newSlab, minSalary: parseFloat(e.target.value) || 0 })}
          />
          <FormField
            name="maxSalary"
            label={t('globalConfig.hraSlab.maximumSalary')}
            type="number"
            value={newSlab.maxSalary}
            onChange={(e) => setNewSlab({ ...newSlab, maxSalary: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <FormField
          name="hraPercentage"
          label={t('globalConfig.hraSlab.hraPercentage')}
          type="number"
          value={newSlab.hraPercentage}
          onChange={(e) => setNewSlab({ ...newSlab, hraPercentage: parseFloat(e.target.value) || 0 })}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('globalConfig.hraSlab.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {t('globalConfig.hraSlab.createHraSlab')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
