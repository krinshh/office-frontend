'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useConfigStore } from '@/lib/configStore';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from '@/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { api } from '@/lib/api';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Settings from 'lucide-react/dist/esm/icons/settings';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Building from 'lucide-react/dist/esm/icons/building';
import Shield from 'lucide-react/dist/esm/icons/shield';

import { HraSlabTable } from './HraSlabTable';
import { ConfigSlabModal } from './ConfigSlabModal';

export function GlobalConfigClient() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const router = useRouter();

  const {
    config: storeConfig,
    hraSlabs: storeHraSlabs,
    fetchConfig,
    fetchHRASlabs,
    setConfig: setStoreConfig
  } = useConfigStore();

  const {
    offices,
    userTypes,
    fetchOffices,
    fetchUserTypes
  } = useAppStore();

  const [formData, setFormData] = useState({
    pfPercentage: 12,
    pfCapAmount: 15000,
    daPercentage: 10,
    professionalTaxAmount: 0,
    professionalTaxThreshold: 21000,
    esiPercentage: 0.75,
    esiThresholdAmount: 21000,
    salaryDeductionDate: 1,
    salaryDeductionHour: 9,
    salaryDeductionMinute: 0,
    ccaBaseSalaryLimit: 0,
    overtimeMultiplier: 1.5,
    lateDeductionPerMinute: 10,
    absentDeductionPerDay: 0,
    taskPenaltyPerOverdue: 0,
    enableTaskPenalties: false,
    employerEsiPercentage: 3.25,
    employerPfPercentage: 13,
  });

  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors,
    setSuccess: setSuccessMsg,
    setLoading: setErrorHandlerLoading
  } = useErrorHandler(t);

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [showAddSlab, setShowAddSlab] = useState(false);
  const [editingSlab, setEditingSlab] = useState<any | null>(null);
  const [newSlab, setNewSlab] = useState({
    office: '',
    userType: '',
    minSalary: 0,
    maxSalary: 0,
    hraPercentage: 0,
  });

  const [hraFilters, setHraFilters] = useState({
    office: '',
    userType: ''
  });

  const { hasPermission } = usePermissions();
  const isAdmin = hasPermission(PERMISSIONS.GLOBAL_CONFIG_MANAGE);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/dashboard');
    } else if (storeConfig) {
      setFormData(prev => ({ ...prev, ...storeConfig }));
    }
  }, [user, isAdmin, router, storeConfig]);

  useEffect(() => {
    if (isAdmin) {
      const loadData = async () => {
        clearErrors();
        try {
          await Promise.allSettled([
            fetchConfig(),
            fetchHRASlabs(),
            fetchUserTypes(),
            fetchOffices()
          ]);
        } catch (error) {
          handleError(error, t('apiErrors.unexpected'));
        }
      };
      loadData();
    }
  }, [isAdmin, fetchConfig, fetchHRASlabs, fetchUserTypes, fetchOffices, clearErrors, handleError, t]);

  const filteredHraSlabs = useMemo(() => {
    return storeHraSlabs.filter(slab => {
      const matchesOffice = !hraFilters.office || (slab.office && slab.office._id === hraFilters.office);
      const matchesUserType = !hraFilters.userType || (slab.userType && slab.userType._id === hraFilters.userType);
      return matchesOffice && matchesUserType;
    });
  }, [storeHraSlabs, hraFilters]);

  const updateConfig = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});
    const newErrors: Record<string, string> = {};
    const tVal = (key: string) => t(`globalConfig.validation.${key}`);

    if (formData.pfPercentage < 0 || formData.pfPercentage > 100) newErrors.pfPercentage = tVal('invalidPercentage');
    if (formData.employerPfPercentage < 0 || formData.employerPfPercentage > 100) newErrors.employerPfPercentage = tVal('invalidPercentage');
    if (formData.pfCapAmount < 0) newErrors.pfCapAmount = tVal('negativeAmount');
    if (formData.pfCapAmount > 10000000) newErrors.pfCapAmount = tVal('amountTooHigh');
    if (formData.daPercentage < 0 || formData.daPercentage > 100) newErrors.daPercentage = tVal('invalidPercentage');
    if (formData.esiPercentage < 0 || formData.esiPercentage > 100) newErrors.esiPercentage = tVal('invalidPercentage');
    if (formData.employerEsiPercentage < 0 || formData.employerEsiPercentage > 100) newErrors.employerEsiPercentage = tVal('invalidPercentage');
    if (formData.salaryDeductionDate < 1 || formData.salaryDeductionDate > 31) newErrors.salaryDeductionDate = tVal('invalidDate');
    if (formData.overtimeMultiplier < 1) newErrors.overtimeMultiplier = tVal('invalidMultiplier');

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await api.globalConfig.update(formData);
      if (res.ok) {
        setStoreConfig(await res.json());
        handleSuccess(t('globalConfig.globalConfigUpdatedSuccessfully'));
      } else {
        handleError(await res.json().catch(() => ({})), t('apiErrors.updateGlobalConfigFailed'));
      }
    } catch (error) {
      handleError(error, t('apiErrors.updateGlobalConfigFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlab = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.globalConfig.createHRASlab(newSlab);
      if (res.ok) {
        handleSuccess(t('globalConfig.hraSlab.hraSlabCreatedSuccessfully'));
        setNewSlab({ office: '', userType: '', minSalary: 0, maxSalary: 0, hraPercentage: 0 });
        setShowAddSlab(false);
        fetchHRASlabs(true);
      } else {
        handleError(await res.json().catch(() => ({})), t('apiErrors.createHRASlabFailed'));
      }
    } catch (error) {
      handleError(error, t('apiErrors.createHRASlabFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlab = async (e: any) => {
    e.preventDefault();
    if (!editingSlab) return;
    setLoading(true);
    try {
      const res = await api.globalConfig.updateHRASlab(editingSlab._id, {
        office: editingSlab.office._id,
        userType: editingSlab.userType._id,
        minSalary: editingSlab.minSalary,
        maxSalary: editingSlab.maxSalary,
        hraPercentage: editingSlab.hraPercentage,
      });
      if (res.ok) {
        handleSuccess(t('globalConfig.hraSlabUpdatedSuccessfully'));
        setEditingSlab(null);
        fetchHRASlabs(true);
      } else {
        handleError(await res.json().catch(() => ({})), t('apiErrors.updateHRASlabFailed'));
      }
    } catch (error) {
      handleError(error, t('apiErrors.updateHRASlabFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlab = async (id: string) => {
    if (!confirm(t('globalConfig.confirmDeleteSlab'))) return;
    try {
      const res = await api.globalConfig.deleteHRASlab(id);
      if (res.ok) {
        handleSuccess(t('globalConfig.hraSlabDeletedSuccessfully'));
        fetchHRASlabs(true);
      } else {
        handleError(await res.json().catch(() => ({})), t('apiErrors.deleteHRASlabFailed'));
      }
    } catch (error) {
      handleError(error, t('apiErrors.deleteHRASlabFailed'));
    }
  };

  // If user is logged in but not an admin, show nothing while redirecting
  if (user && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('globalConfig.title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('globalConfig.subtitle')}</p>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} t={t} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} t={t} />}

      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('globalConfig.sections.providentFund')}</h2>
        </div>
        <form onSubmit={updateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" autoComplete="off">
          <FormField label={t('globalConfig.form.pfPercentage')} type="number" value={formData.pfPercentage} onChange={(e) => setFormData({ ...formData, pfPercentage: parseFloat(e.target.value) || 0 })} error={validationErrors.pfPercentage} name="pfPercentage" />
          <FormField label={t('globalConfig.form.employerPfPercentage')} type="number" value={formData.employerPfPercentage} onChange={(e) => setFormData({ ...formData, employerPfPercentage: parseFloat(e.target.value) || 0 })} error={validationErrors.employerPfPercentage} name="employerPfPercentage" />
          <FormField label={t('globalConfig.form.pfCapAmount')} type="number" value={formData.pfCapAmount} onChange={(e) => setFormData({ ...formData, pfCapAmount: parseFloat(e.target.value) || 0 })} error={validationErrors.pfCapAmount} name="pfCapAmount" />
          <div className="col-span-full"><Button type="submit" className="w-full md:w-auto" loading={loading}>{t('globalConfig.buttons.updateDeductions')}</Button></div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('globalConfig.sections.employeeStateInsurance')}</h2>
        </div>
        <form onSubmit={updateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" autoComplete="off">
          <FormField label={t('globalConfig.form.esiPercentage')} type="number" value={formData.esiPercentage} onChange={(e) => setFormData({ ...formData, esiPercentage: parseFloat(e.target.value) || 0 })} error={validationErrors.esiPercentage} name="esiPercentage" />
          <FormField label={t('globalConfig.form.employerEsiPercentage')} type="number" value={formData.employerEsiPercentage} onChange={(e) => setFormData({ ...formData, employerEsiPercentage: parseFloat(e.target.value) || 0 })} error={validationErrors.employerEsiPercentage} name="employerEsiPercentage" />
          <FormField label={t('globalConfig.form.esiThresholdAmount')} type="number" value={formData.esiThresholdAmount} onChange={(e) => setFormData({ ...formData, esiThresholdAmount: parseFloat(e.target.value) || 0 })} error={validationErrors.esiThresholdAmount} name="esiThresholdAmount" />
          <div className="col-span-full"><Button type="submit" className="w-full md:w-auto" loading={loading}>{t('globalConfig.buttons.updateDeductions')}</Button></div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('globalConfig.sections.salaryComponents')}</h2>
        </div>
        <form onSubmit={updateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" autoComplete="off">
          <FormField label={t('globalConfig.form.daPercentage')} type="number" value={formData.daPercentage} onChange={(e) => setFormData({ ...formData, daPercentage: parseFloat(e.target.value) || 0 })} error={validationErrors.daPercentage} name="daPercentage" />
          <FormField label={t('globalConfig.form.ccaBaseSalaryLimit')} type="number" value={formData.ccaBaseSalaryLimit} onChange={(e) => setFormData({ ...formData, ccaBaseSalaryLimit: parseFloat(e.target.value) || 0 })} error={validationErrors.ccaBaseSalaryLimit} name="ccaBaseSalaryLimit" />
          <FormField label={t('globalConfig.form.professionalTaxAmount')} type="number" value={formData.professionalTaxAmount} onChange={(e) => setFormData({ ...formData, professionalTaxAmount: parseFloat(e.target.value) || 0 })} error={validationErrors.professionalTaxAmount} name="professionalTaxAmount" />
          <FormField label={t('globalConfig.form.professionalTaxThreshold')} type="number" value={formData.professionalTaxThreshold} onChange={(e) => setFormData({ ...formData, professionalTaxThreshold: parseFloat(e.target.value) || 0 })} error={validationErrors.professionalTaxThreshold} name="professionalTaxThreshold" />
          <div className="col-span-full"><Button type="submit" className="w-full md:w-auto" loading={loading}>{t('globalConfig.buttons.updateSalaryConfiguration')}</Button></div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('globalConfig.sections.attendancePenalties')}</h2>
        </div>
        <form onSubmit={updateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" autoComplete="off">
          <FormField label={t('globalConfig.form.lateDeductionPerMinute')} type="number" value={formData.lateDeductionPerMinute} onChange={(e) => setFormData({ ...formData, lateDeductionPerMinute: parseFloat(e.target.value) || 0 })} error={validationErrors.lateDeductionPerMinute} name="lateDeductionPerMinute" />
          <FormField label={t('globalConfig.form.absentDeductionPerDay')} type="number" value={formData.absentDeductionPerDay} onChange={(e) => setFormData({ ...formData, absentDeductionPerDay: parseFloat(e.target.value) || 0 })} error={validationErrors.absentDeductionPerDay} name="absentDeductionPerDay" />
          <FormField label={t('globalConfig.form.overtimeMultiplier')} type="number" value={formData.overtimeMultiplier} onChange={(e) => setFormData({ ...formData, overtimeMultiplier: parseFloat(e.target.value) || 0 })} error={validationErrors.overtimeMultiplier} name="overtimeMultiplier" />
          <FormField label={t('globalConfig.form.taskPenaltyPerOverdue')} type="number" value={formData.taskPenaltyPerOverdue} onChange={(e) => setFormData({ ...formData, taskPenaltyPerOverdue: parseFloat(e.target.value) || 0 })} error={validationErrors.taskPenaltyPerOverdue} name="taskPenaltyPerOverdue" />
          <div className="flex flex-col"><span className="block text-sm font-medium text-foreground mb-1">&nbsp;</span>
            <label htmlFor="enableTaskPenalties" className="flex items-center h-10 px-3 bg-card border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
              <input type="checkbox" id="enableTaskPenalties" checked={formData.enableTaskPenalties} onChange={(e) => setFormData({ ...formData, enableTaskPenalties: e.target.checked })} className="w-4 h-4 mr-3 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2" />
              <span className="text-sm font-medium text-foreground">{t('globalConfig.form.enableTaskPenalties')}</span>
            </label>
          </div>
          <div className="col-span-full"><Button type="submit" className="w-full md:w-auto" loading={loading}>{t('globalConfig.buttons.updateAttendanceSettings')}</Button></div>
        </form>
      </Card>

      <Card className="p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('globalConfig.sections.payoutScheduling')}</h2>
        </div>
        <form onSubmit={updateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" autoComplete="off">
          <FormField label={t('globalConfig.form.salaryDeductionDate')} type="number" value={formData.salaryDeductionDate} onChange={(e) => setFormData({ ...formData, salaryDeductionDate: parseInt(e.target.value) || 1 })} error={validationErrors.salaryDeductionDate} name="salaryDeductionDate" />
          <div className="space-y-1">
            <label htmlFor="salaryDeductionHour" className="block text-sm font-medium text-foreground mb-1">{t('globalConfig.form.salaryProcessingTime')}</label>
            <div className="flex gap-4">
              <Select id="salaryDeductionHour" aria-label={t('globalConfig.form.salaryProcessingTime')} value={formData.salaryDeductionHour.toString()} onChange={(e) => setFormData({ ...formData, salaryDeductionHour: parseInt(e.target.value) || 0 })} options={Array.from({ length: 24 }, (_, i) => ({ value: i.toString(), label: `${i.toString().padStart(2, '0')}:00` }))} className="flex-1" autoComplete="off" />
              <Select id="salaryDeductionMinute" aria-label={t('globalConfig.form.salaryProcessingTime')} value={formData.salaryDeductionMinute.toString()} onChange={(e) => setFormData({ ...formData, salaryDeductionMinute: parseInt(e.target.value) || 0 })} options={Array.from({ length: 60 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, '0') }))} className="flex-1" autoComplete="off" />
            </div>
          </div>
          <div className="col-span-full"><Button type="submit" className="w-full md:w-auto" loading={loading}>{t('globalConfig.buttons.updateAttendanceSettings')}</Button></div>
        </form>
      </Card>

      <HraSlabTable slabs={filteredHraSlabs} offices={offices} userTypes={userTypes} filters={hraFilters} setFilters={setHraFilters} editingSlab={editingSlab} setEditingSlab={setEditingSlab} onUpdate={handleUpdateSlab} onDelete={handleDeleteSlab} onAddSlab={() => setShowAddSlab(true)} loading={loading} />

      <ConfigSlabModal isOpen={showAddSlab} onClose={() => setShowAddSlab(false)} newSlab={newSlab} setNewSlab={setNewSlab} offices={offices} userTypes={userTypes} onSubmit={handleCreateSlab} loading={loading} errors={errors} />
    </div>
  );
}
