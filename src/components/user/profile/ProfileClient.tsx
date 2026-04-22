'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Card from '@/components/Card';
import Spinner from '@/components/Spinner';
import UserIcon from 'lucide-react/dist/esm/icons/user';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Save from 'lucide-react/dist/esm/icons/save';
import X from 'lucide-react/dist/esm/icons/x';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { VALID_REGEX } from '@/constants/regex';
import { useAttendanceStore } from '@/lib/attendanceStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ProfileSidebar } from './ProfileSidebar';
import { WorkInformationCard, BankDetailsCard } from './ProfileCards';
import { AttendanceStatsCard } from './AttendanceStatsCard';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  userType?: {
    _id: string;
    name: string;
  };
  office?: {
    _id: string;
    name: string;
  };
  ctc: number;
  baseSalary: number;
  joiningDate: string;
  shiftTimings?: {
    start: string;
    end: string;
  };
  allowedLateMinutes?: number;
  accountDetails?: {
    name: string;
    ifsc: string;
    accountNumber: string;
    upiId: string;
  };
  photo?: string;
}

interface AttendanceStats {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  currentStreak: number;
}

export function ProfileClient() {
  const t = useTranslations();
  const { user: storeUser, updateUserData } = useAuthStore();
  const {
    errors,
    success: successMsg,
    handleError,
    handleSuccess,
    clearErrors,
    setErrors
  } = useErrorHandler(t);

  const [user, setUser] = useState<UserProfile | null>(storeUser ? {
    _id: storeUser.id,
    name: storeUser.name,
    email: storeUser.email,
    mobile: storeUser.mobile || '',
    userType: storeUser.userType,
    office: storeUser.office,
    ctc: storeUser.ctc || 0,
    baseSalary: storeUser.baseSalary || 0,
    joiningDate: storeUser.joiningDate || '',
    shiftTimings: storeUser.shiftTimings,
    accountDetails: storeUser.accountDetails,
    photo: storeUser.photo,
  } : null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalPresent: 0,
    totalLate: 0,
    totalAbsent: 0,
    currentStreak: 0,
  });

  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const [editData, setEditData] = useState({
    name: storeUser?.name || '',
    mobile: storeUser?.mobile || '',
    accountDetails: storeUser?.accountDetails || {
      name: '',
      ifsc: '',
      accountNumber: '',
      upiId: '',
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
        handleError({ message: t('userProfile.validation.invalidFileType') });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        handleError({ message: t('userProfile.validation.fileTooLarge') });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (storeUser) {
      setUser({
        _id: storeUser.id,
        name: storeUser.name,
        email: storeUser.email,
        mobile: storeUser.mobile || '',
        userType: storeUser.userType,
        office: storeUser.office,
        ctc: storeUser.ctc || 0,
        baseSalary: storeUser.baseSalary || 0,
        joiningDate: storeUser.joiningDate || '',
        shiftTimings: storeUser.shiftTimings,
        accountDetails: storeUser.accountDetails,
        photo: storeUser.photo,
      });

      if (!editing) {
        setEditData({
          name: storeUser.name,
          mobile: storeUser.mobile || '',
          accountDetails: storeUser.accountDetails || {
            name: '',
            ifsc: '',
            accountNumber: '',
            upiId: '',
          },
        });
      }
    }
  }, [storeUser, editing]);

  useEffect(() => {
    const initData = async () => {
      try {
        let currentProfile = user;
        if (!currentProfile || !currentProfile.joiningDate) {
          const response = await api.auth.getMe();
          if (response.ok) {
            currentProfile = await response.json();
            setUser(currentProfile);
            updateUserData({ ...currentProfile });
          }
        }
        if (currentProfile) {
          await fetchMyAttendance(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setPageLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (user && myAttendance.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const records = myAttendance.filter((r: any) => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalPresent = records.filter((r: any) => r.status === 'Present').length;
      const totalLate = records.filter((r: any) => r.status === 'Late').length;
      const totalHalfDay = records.filter((r: any) => r.status === 'Half-Day').length;

      const joiningDate = user.joiningDate ? new Date(user.joiningDate) : new Date(currentYear, currentMonth, 1);
      let startDate = new Date(currentYear, currentMonth, 1);
      if (!isNaN(joiningDate.getTime()) && joiningDate > startDate) startDate = joiningDate;

      let workingDays = 0;
      let loopDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      while (loopDate <= today) {
        if (loopDate.getDay() !== 0) workingDays++;
        loopDate.setDate(loopDate.getDate() + 1);
      }

      const presentCount = totalPresent + totalLate + totalHalfDay;
      const totalAbsent = Math.max(0, workingDays - presentCount);

      let currentStreak = 0;
      const sortedRecords = [...myAttendance].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sortedRecords.length > 0) {
        let lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);
        const mostRecentRecordDate = new Date(sortedRecords[0].date);
        mostRecentRecordDate.setHours(0, 0, 0, 0);
        const diffDays = (lastDate.getTime() - mostRecentRecordDate.getTime()) / (1000 * 3600 * 24);

        let isStreakAlive = false;
        if (lastDate.getDay() === 1) { if (diffDays <= 3) isStreakAlive = true; }
        else if (lastDate.getDay() === 0) { if (diffDays <= 2) isStreakAlive = true; }
        else if (lastDate.getDay() === 6) { if (diffDays <= 1) isStreakAlive = true; }
        else { if (diffDays <= 1) isStreakAlive = true; }

        if (isStreakAlive) {
          for (let i = 0; i < sortedRecords.length; i++) {
            if (i > 0) {
              const prevDate = new Date(sortedRecords[i - 1].date);
              const currDate = new Date(sortedRecords[i].date);
              const gap = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
              let gapBroken = false;
              for (let d = 1; d < gap; d++) {
                const check = new Date(prevDate);
                check.setDate(prevDate.getDate() - d);
                if (check.getDay() !== 0) { gapBroken = true; break; }
              }
              if (gapBroken) break;
            }
            if (['Present', 'Late', 'Half-Day'].includes(sortedRecords[i].status)) currentStreak++;
            else break;
          }
        }
      }
      setAttendanceStats({ totalPresent, totalLate, totalAbsent, currentStreak });
    }
  }, [user, myAttendance]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    clearErrors();
    const newErrors: Record<string, string> = {};

    if (!editData.mobile) {
      newErrors.mobile = t('users.validation.mobileRequired');
    } else if (!VALID_REGEX.MOBILE.test(editData.mobile)) {
      newErrors.mobile = t('users.validation.mobileInvalid');
    }

    if (editData.accountDetails.ifsc && !VALID_REGEX.IFSC.test(editData.accountDetails.ifsc)) {
      newErrors.ifscCode = t('users.validation.ifscInvalid');
    }

    const hasAnyBankDetails = editData.accountDetails.accountNumber || editData.accountDetails.name || editData.accountDetails.ifsc;
    const hasCompleteBankDetails = editData.accountDetails.accountNumber && editData.accountDetails.name && editData.accountDetails.ifsc;
    const hasUPI = editData.accountDetails.upiId;

    if (!hasCompleteBankDetails && !hasUPI) {
      if (hasAnyBankDetails) {
        if (!editData.accountDetails.name) newErrors.accountHolderName = t('users.validation.required');
        if (!editData.accountDetails.accountNumber) newErrors.accountNumber = t('users.validation.required');
        if (!editData.accountDetails.ifsc) newErrors.ifscCode = t('users.validation.required');
      }
      if (!hasAnyBankDetails && !hasUPI) {
        newErrors.accountHolderName = t('users.validation.bankOrUpiRequired');
        newErrors.upiId = t('users.validation.bankOrUpiRequired');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaving(false);
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    try {
      let payload: any;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('name', editData.name);
        formData.append('mobile', editData.mobile);
        formData.append('accountDetails', JSON.stringify(editData.accountDetails));
        formData.append('photo', selectedFile);
        payload = formData;
      } else {
        payload = {
          name: editData.name,
          mobile: editData.mobile,
          accountDetails: editData.accountDetails
        };
      }

      const response = await api.users.updateProfile(payload);
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        updateUserData({
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          userType: updatedUser.userType,
          office: updatedUser.office,
          shiftTimings: updatedUser.shiftTimings,
          accountDetails: updatedUser.accountDetails,
          photo: updatedUser.photo,
        });
        handleSuccess(t('userProfile.profileUpdatedSuccessfully'));
        setEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, t('userProfile.failedToUpdateProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      handleError(error, t('userProfile.errorUpdatingProfile'));
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        name: user.name,
        mobile: user.mobile,
        accountDetails: user.accountDetails || { name: '', ifsc: '', accountNumber: '', upiId: '' },
      });
    }
    setEditing(false);
    clearErrors();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full">
            <UserIcon className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('userProfile.messages.profileNotFound')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('userProfile.messages.unableToLoadProfile')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('userProfile.title')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('userProfile.subtitle')}</p>
        </div>
        <div className="w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {!editing ? (
              <Button onClick={() => setEditing(true)} className="w-full sm:w-auto flex items-center justify-center gap-2" variant="secondary">
                <Edit3 className="w-4 h-4" />
                {t('userProfile.buttons.editProfile')}
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={saving} variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                  {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                  {saving ? t('userProfile.buttons.saving') : t('userProfile.buttons.saveChanges')}
                </Button>
                <Button onClick={handleCancel} variant="outline2" className="w-full sm:w-auto flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  {t('userProfile.buttons.cancel')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => clearErrors()} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <ProfileSidebar user={user} editing={editing} editData={editData} setEditData={setEditData} previewUrl={previewUrl} onFileClick={() => fileInputRef.current?.click()} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} handleFileChange={handleFileChange} errors={errors} setErrors={setErrors} />

        <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
          <WorkInformationCard user={user} />
          <BankDetailsCard editing={editing} editData={editData} setEditData={setEditData} user={user} errors={errors} />
          <AttendanceStatsCard stats={attendanceStats} />
        </div>
      </div>
    </div>
  );
}
