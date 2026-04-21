'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import FormField from '@/components/FormField';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import { VALID_REGEX } from '@/constants/regex';

interface UserFormModalContentProps {
  editingUser: any;
  userTypeOptions: any[];
  officeOptions: any[];
  onClose: () => void;
  onSuccess: (user: any) => void;
  userTypes: any[];
}

const COUNTRY_CODES = [
  { value: '+91', label: '🇮🇳 +91 (India)' },
  { value: '+1', label: '🇺🇸 +1 (USA)' },
  { value: '+44', label: '🇬🇧 +44 (UK)' },
  { value: '+971', label: '🇦🇪 +971 (UAE)' },
  { value: '+61', label: '🇦🇺 +61 (Australia)' },
  { value: '+81', label: '🇯🇵 +81 (Japan)' },
  { value: '+49', label: '🇩🇪 +49 (Germany)' },
  { value: '+33', label: '🇫🇷 +33 (France)' },
  { value: '+7', label: '🇷🇺 +7 (Russia)' },
  { value: '+86', label: '🇨🇳 +86 (China)' },
];

export const UserFormModalContent = ({
  editingUser,
  userTypeOptions,
  officeOptions,
  onClose,
  onSuccess,
  userTypes
}: UserFormModalContentProps) => {
  const t = useTranslations();
  const [submitting, setSubmitting] = React.useState(false);
  const { errors, handleError, setErrors, clearErrors } = useErrorHandler(t);

  const [userData, setUserData] = React.useState({
    name: editingUser?.name || '',
    username: editingUser?.username || '',
    email: editingUser?.email || '',
    mobile: editingUser?.mobile || '',
    password: editingUser ? '********' : '',
    userType: editingUser?.userType?._id || editingUser?.userType?.name || '',
    office: editingUser?.office?._id || editingUser?.office?.name || '',
    photo: null as File | null,
    address: editingUser?.address || '',
    joiningDate: editingUser?.joiningDate?.split('T')[0] || '',
    ctc: editingUser?.ctc?.toString() || '',
    baseSalary: editingUser?.baseSalary?.toString() || '',
    ta: (editingUser?.TA ?? editingUser?.ta ?? '').toString(),
    oneTimeJoiningBonus: (editingUser?.oneTimeJoiningBonus ?? '').toString(),
    vpf: (editingUser?.VPF ?? editingUser?.vpf ?? '').toString(),
    gratuity: (editingUser?.gratuity ?? '').toString(),
    shiftTimings: editingUser?.shiftTimings || { start: '09:00', end: '18:00' },
    allowedLateMinutes: editingUser?.allowedLateMinutes?.toString() || '10',
    accountDetails: editingUser?.accountDetails || {
      name: '',
      accountNumber: '',
      ifsc: '',
      upiId: '',
    },
  });

  const handleNumericInput = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanValue = e.target.value.replace(VALID_REGEX.NUMERIC_DECIMAL, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) cleanValue = parts[0] + '.' + parts.slice(1).join('');
    e.target.value = cleanValue;
    setUserData(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!userData.name.trim()) newErrors.name = t('users.validation.fullNameRequired');
    else if (!VALID_REGEX.NAME.test(userData.name.trim())) newErrors.name = t('users.validation.nameFormatInvalid');

    if (!userData.username?.trim()) newErrors.username = t('users.validation.usernameRequired');
    else if (!VALID_REGEX.USERNAME.test(userData.username.trim())) newErrors.username = t('users.validation.usernameFormat');

    if (!userData.email.trim()) newErrors.email = t('users.validation.emailRequired');
    else if (!VALID_REGEX.EMAIL.test(userData.email)) newErrors.email = t('users.validation.emailInvalid');

    if (!userData.mobile.trim()) newErrors.mobile = t('users.validation.mobileRequired');
    else if (!VALID_REGEX.MOBILE.test(userData.mobile.replace(/\s+/g, ''))) newErrors.mobile = t('users.validation.mobileInvalid');

    if (!editingUser && !userData.password) newErrors.password = t('users.validation.passwordRequired');
    else if (userData.password && userData.password !== '********') {
      if (!VALID_REGEX.PASSWORD.test(userData.password)) newErrors.password = t('users.validation.passwordComplexity');
    }

    if (!userData.userType) newErrors.userType = t('users.validation.userTypeRequired');

    if (userData.userType) {
      const selectedUserType = userTypes.find((type: any) => type._id === userData.userType || type.name === userData.userType);
      if (selectedUserType && selectedUserType.name !== 'Admin' && (!userData.office || userData.office === '')) {
        newErrors.office = t('users.validation.officeRequired');
      }
    }

    if (!userData.ctc) newErrors.ctc = t('users.validation.ctcRequired');
    if (!userData.baseSalary) newErrors.baseSalary = t('users.validation.baseSalaryRequired');
    if (userData.ta === '' || parseFloat(userData.ta) < 0) newErrors.ta = t('users.validation.taRequired');
    if (!userData.vpf || parseFloat(userData.vpf) < 0) newErrors.vpf = t('users.validation.vpfRequired');

    const ctc = parseFloat(userData.ctc);
    const baseSalary = parseFloat(userData.baseSalary);
    const ta = parseFloat(userData.ta);
    const bonus = parseFloat(userData.oneTimeJoiningBonus);
    const gratuity = parseFloat(userData.gratuity);

    if (ctc > 10000000) newErrors.ctc = t('users.validation.ctcLimit');
    if (baseSalary > 10000000) newErrors.baseSalary = t('users.validation.baseSalaryLimit');
    if (baseSalary > ctc) newErrors.baseSalary = t('users.validation.salaryMismatch');
    if (ta > 100000) newErrors.ta = t('users.validation.taLimit');
    if (bonus > 1000000) newErrors.oneTimeJoiningBonus = t('users.validation.bonusLimit');
    if (gratuity > 5000000) newErrors.gratuity = t('users.validation.gratuityLimit');
    if (parseFloat(userData.vpf) > 100) newErrors.vpf = t('users.validation.vpfLimit');

    const lateMinutes = parseInt(userData.allowedLateMinutes);
    if (isNaN(lateMinutes) || lateMinutes < 0 || lateMinutes > 480) {
      newErrors.allowedLateMinutes = t('users.validation.lateMinutesInvalid');
    }

    if (!userData.joiningDate) newErrors.joiningDate = t('users.validation.joiningDateRequired');
    if (!userData.shiftTimings.start) newErrors.shiftStart = t('users.validation.startTimeRequired');
    if (!userData.shiftTimings.end) newErrors.shiftEnd = t('users.validation.endTimeRequired');
    if (userData.shiftTimings.start && userData.shiftTimings.end && userData.shiftTimings.start === userData.shiftTimings.end) {
      newErrors.shiftEnd = t('users.validation.shiftTimesCannotBeSame');
    }

    if (baseSalary < 0) newErrors.baseSalary = t('users.validation.negativeSalary');
    if (ctc < 0) newErrors.ctc = t('users.validation.negativeSalary');

    const hasAnyBankDetails = userData.accountDetails.accountNumber || userData.accountDetails.name || userData.accountDetails.ifsc;
    const hasCompleteBankDetails = userData.accountDetails.accountNumber && userData.accountDetails.name && userData.accountDetails.ifsc;
    const hasUPI = userData.accountDetails.upiId;

    if (userData.accountDetails.ifsc && !VALID_REGEX.IFSC.test(userData.accountDetails.ifsc)) {
      newErrors.ifsc = t('users.validation.ifscInvalid');
    }

    if (!hasCompleteBankDetails && !hasUPI) {
      if (hasAnyBankDetails) {
        newErrors.accountNumber = t('users.validation.incompleteBankDetails');
      } else {
        newErrors.accountNumber = t('users.validation.bankOrUpiRequired');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        let element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey);

        if (!element && firstErrorKey.includes('accountDetails')) {
          element = document.getElementsByName('accountDetails.accountNumber')[0] || document.getElementsByName('accountDetails.name')[0] || document.getElementsByName('accountDetails.ifsc')[0] || document.getElementsByName('accountDetails.upiId')[0];
        }
        if (!element && firstErrorKey === 'shiftStart') element = document.getElementsByName('shiftTimings.start')[0];
        if (!element && firstErrorKey === 'shiftEnd') element = document.getElementsByName('shiftTimings.end')[0];

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        } else {
          const firstErrorId = `${firstErrorKey}-error`;
          const errElement = document.getElementById(firstErrorId);
          if (errElement) errElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return;
    }

    try {
      const formDataInstance = new FormData();
      formDataInstance.append('name', userData.name.trim());
      formDataInstance.append('username', userData.username?.trim() || '');
      formDataInstance.append('email', userData.email.trim().toLowerCase());
      formDataInstance.append('mobile', userData.mobile.trim());
      formDataInstance.append('userType', userData.userType);
      if (userData.office) formDataInstance.append('office', userData.office);
      formDataInstance.append('address', userData.address?.trim() || '');
      formDataInstance.append('joiningDate', userData.joiningDate);
      formDataInstance.append('ctc', userData.ctc || '0');
      formDataInstance.append('baseSalary', userData.baseSalary || '0');
      formDataInstance.append('TA', userData.ta || '0');
      formDataInstance.append('oneTimeJoiningBonus', userData.oneTimeJoiningBonus || '0');
      formDataInstance.append('VPF', userData.vpf || '0');
      formDataInstance.append('gratuity', userData.gratuity || '0');
      formDataInstance.append('allowedLateMinutes', userData.allowedLateMinutes || '10');
      formDataInstance.append('shiftTimings', JSON.stringify(userData.shiftTimings));
      formDataInstance.append('accountDetails', JSON.stringify(userData.accountDetails));

      if (userData.photo) {
        formDataInstance.append('photo', userData.photo);
      }

      if (userData.password && userData.password !== '********') {
        formDataInstance.append('password', userData.password);
      }

      const response = editingUser
        ? await api.users.update(editingUser._id, formDataInstance)
        : await api.users.create(formDataInstance);

      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, editingUser ? t('users.errors.failedToSave') : t('users.errors.failedToSave'));
      }
    } catch (err) {
      handleError(err, t('users.errors.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleUserSubmit} className="space-y-6 md:space-y-8" autoComplete="off">
      {errors.global && <Alert type="error" message={errors.global} onClose={() => setErrors({ ...errors, global: '' })} />}

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-bold text-primary border-b pb-2">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
          <FormField name="name" label={t('users.form.fullName')} value={userData.name} onChange={(e) => {
            const val = e.target.value.replace(VALID_REGEX.NAME_CLEAN, '').slice(0, 50);
            setUserData({ ...userData, name: val });
          }} error={errors.name} autoComplete="off" />
          <FormField name="username" label={t('users.form.username')} value={userData.username} onChange={(e) => {
            const val = e.target.value.replace(VALID_REGEX.USERNAME_CLEAN, '').slice(0, 20);
            setUserData({ ...userData, username: val });
          }} error={errors.username} autoComplete="off" />
          <FormField name="email" label={t('users.form.emailAddress')} type="email" value={userData.email} onChange={(e) => {
            const val = e.target.value.replace(VALID_REGEX.EMAIL_CLEAN, '').toLowerCase();
            setUserData({ ...userData, email: val });
          }} error={errors.email} autoComplete="off" />
          <div className="flex gap-4">
            <div className="w-[110px] flex-shrink-0">
              <Select
                label={t('users.form.countryCode') || 'Code'}
                options={COUNTRY_CODES}
                value={COUNTRY_CODES.find(c => userData.mobile.startsWith(c.value))?.value || '+91'}
                onChange={(e) => {
                  const newCode = e.target.value;
                  const currentVal = userData.mobile || '';
                  const matchedCode = [...COUNTRY_CODES]
                    .sort((a, b) => b.value.length - a.value.length)
                    .find(c => currentVal.startsWith(c.value))?.value || '';

                  const mainNumber = matchedCode ? currentVal.slice(matchedCode.length) : currentVal.replace(VALID_REGEX.NON_DIGIT, '');
                  setUserData({ ...userData, mobile: newCode + mainNumber });
                }}
                fullWidth={true}
              />
            </div>
            <div className="flex-1">
              <Input
                label={t('users.form.mobileNumber')}
                type="tel"
                placeholder="XXX-XXX-XXXX"
                value={(() => {
                  const currentVal = userData.mobile || '';
                  const matchedCode = [...COUNTRY_CODES]
                    .sort((a, b) => b.value.length - a.value.length)
                    .find(c => currentVal.startsWith(c.value))?.value || '';
                  let main = matchedCode ? currentVal.slice(matchedCode.length) : currentVal;
                  return main.replace(VALID_REGEX.PHONE_FORMAT_1, '$1-$2-$3')
                    .replace(VALID_REGEX.PHONE_FORMAT_2, '$1-$2')
                    .replace(VALID_REGEX.DOUBLE_HYPHEN, '-');
                })()}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(VALID_REGEX.NON_DIGIT, '').slice(0, 15);
                  const currentVal = userData.mobile || '';
                  const code = [...COUNTRY_CODES]
                    .sort((a, b) => b.value.length - a.value.length)
                    .find(c => currentVal.startsWith(c.value))?.value || '+91';
                  setUserData({ ...userData, mobile: code + rawVal });
                }}
                error={errors.mobile}
                fullWidth={true}
              />
            </div>
          </div>
          <FormField name="password" label={t('users.form.password')} type="password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} placeholder={editingUser ? t('users.placeholders.leaveBlankToKeep') : undefined} error={errors.password} autoComplete="new-password" />
          <Select name="userType" id="userType" label={t('users.form.userType')} value={userData.userType} onChange={(e) => setUserData({ ...userData, userType: e.target.value })} options={userTypeOptions} placeholder={t('users.placeholders.selectUserType')} error={errors.userType} autoComplete="off" />
          <Select name="office" id="office" label={t('users.form.office')} value={userData.office} onChange={(e) => setUserData({ ...userData, office: e.target.value })} options={officeOptions} placeholder={t('users.placeholders.selectOffice')} error={errors.office} autoComplete="off" />
          <div className="space-y-1.5">
            <label htmlFor="user-photo-upload" className="block text-sm font-medium text-foreground cursor-pointer select-none">
              {t('users.form.photoUrl')}
            </label>
            <div className="flex items-center gap-4">
              {(userData.photo || editingUser?.photo) && (
                <img
                  src={
                    userData.photo instanceof File
                      ? URL.createObjectURL(userData.photo)
                      : (editingUser?.photo?.startsWith('http') ? editingUser.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${editingUser?.photo}`)
                  }
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="user-photo-upload"
                  name="photo"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: t('users.validation.fileSize') })); return; }
                    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) { setErrors(prev => ({ ...prev, photo: t('users.validation.photoFileType') })); return; }
                    setUserData(prev => ({ ...prev, photo: file })); setErrors(prev => { const newErrs = { ...prev }; delete newErrs.photo; return newErrs; });
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {errors.photo && <p className="text-xs text-destructive mt-1">{errors.photo}</p>}
              </div>
            </div>
          </div>
          <FormField name="joiningDate" label={t('users.form.joiningDate')} type="date" value={userData.joiningDate} onChange={(e) => setUserData({ ...userData, joiningDate: e.target.value })} error={errors.joiningDate} autoComplete="off" />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-bold text-primary border-b pb-2">Compensation & Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
          <FormField name="shiftStart" label={t('users.form.shiftStartTime')} type="time" value={userData.shiftTimings.start} onChange={(e) => setUserData({ ...userData, shiftTimings: { ...userData.shiftTimings, start: e.target.value } })} error={errors.shiftStart} autoComplete="off" />
          <FormField name="shiftEnd" label={t('users.form.shiftEndTime')} type="time" value={userData.shiftTimings.end} onChange={(e) => setUserData({ ...userData, shiftTimings: { ...userData.shiftTimings, end: e.target.value } })} error={errors.shiftEnd} autoComplete="off" />
          <FormField name="allowedLateMinutes" label={t('users.form.allowedLateMinutes')} type="text" value={userData.allowedLateMinutes} onChange={handleNumericInput('allowedLateMinutes')} placeholder={t('users.placeholders.gracePeriod')} error={errors.allowedLateMinutes} autoComplete="off" />
          <FormField name="ctc" label={t('users.form.ctc')} type="text" value={userData.ctc} onChange={handleNumericInput('ctc')} error={errors.ctc} autoComplete="off" />
          <FormField name="baseSalary" label={t('users.form.baseSalary')} type="text" value={userData.baseSalary} onChange={handleNumericInput('baseSalary')} error={errors.baseSalary} autoComplete="off" />
          <FormField name="ta" label={t('users.form.travelAllowance')} type="text" value={userData.ta} onChange={handleNumericInput('ta')} error={errors.ta} autoComplete="off" />
          <FormField name="oneTimeJoiningBonus" label={t('users.form.joiningBonus')} type="text" value={userData.oneTimeJoiningBonus} onChange={handleNumericInput('oneTimeJoiningBonus')} error={errors.oneTimeJoiningBonus} autoComplete="off" />
          <FormField name="gratuity" label={t('users.form.gratuity')} type="text" value={userData.gratuity} onChange={handleNumericInput('gratuity')} error={errors.gratuity} autoComplete="off" />
          <FormField name="vpf" label={t('users.form.vpf')} type="text" value={userData.vpf} onChange={(e) => {
            let val = e.target.value.replace(/[^0-9.]/g, '');
            if (val.split('.').length > 2) val = val.split('.')[0] + '.' + val.split('.').slice(1).join('');
            if (parseFloat(val) > 100) val = '100';
            setUserData(prev => ({ ...prev, vpf: val }));
          }} error={errors.vpf} autoComplete="off" />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-bold text-primary border-b pb-2">{t('users.form.bankAccountDetails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
          <FormField name="accountName" id="bank-account-name" label={t('users.form.accountHolderName')} value={userData.accountDetails.name} onChange={(e) => setUserData({ ...userData, accountDetails: { ...userData.accountDetails, name: e.target.value } })} error={errors.accountName} autoComplete="off" />
          <FormField name="accountNumber" id="bank-account-number" label={t('users.form.accountNumber')} value={userData.accountDetails.accountNumber} onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 18);
            e.target.value = val;
            setUserData({ ...userData, accountDetails: { ...userData.accountDetails, accountNumber: val } });
          }} error={errors.accountNumber} autoComplete="off" />
          <FormField name="ifsc" id="bank-account-ifsc" label={t('users.form.ifscCode')} value={userData.accountDetails.ifsc} onChange={(e) => setUserData({ ...userData, accountDetails: { ...userData.accountDetails, ifsc: e.target.value } })} error={errors.ifsc} autoComplete="off" />
          <FormField name="upiId" id="bank-account-upi" label={t('users.form.upiId')} value={userData.accountDetails.upiId} onChange={(e) => setUserData({ ...userData, accountDetails: { ...userData.accountDetails, upiId: e.target.value } })} placeholder={t('users.placeholders.upiExample')} error={errors.upiId} autoComplete="off" />
          <div className="md:col-span-2">
            <Textarea
              name="address"
              id="user-address"
              label={t('users.form.address')}
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              rows={3}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>{t('users.cancel')}</Button>
        <Button type="submit" loading={submitting}>{editingUser ? t('users.updateUser') : t('users.createUser')}</Button>
      </div>
    </form>
  );
};
