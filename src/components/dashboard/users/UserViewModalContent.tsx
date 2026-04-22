'use client';

import { useTranslations } from 'next-intl';
import { Button, ImagePreview } from '@/components';
import Building from 'lucide-react/dist/esm/icons/building';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import User from 'lucide-react/dist/esm/icons/user';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { formatPhone, formatCurrency, formatDate, getPhotoUrl } from '@/utils/formatters';

interface FullUser {
  _id: string;
  name: string;
  username?: string;
  email: string;
  mobile: string;
  userType?: { name: string };
  office?: { name: string };
  photo?: string;
  address?: string;
  joiningDate: string;
  ctc: number;
  baseSalary: number;
  ta?: number;
  TA?: number;
  oneTimeJoiningBonus: number;
  vpf?: number;
  VPF?: number;
  gratuity: number;
  accountDetails?: {
    name: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
}

interface UserViewModalContentProps {
  user: FullUser;
  onEdit: () => void;
  onDelete: () => void;
}

export const UserViewModalContent = ({
  user,
  onEdit,
  onDelete
}: UserViewModalContentProps) => {
  const t = useTranslations();

  return (
    <div className="space-y-4 md:space-y-6 pb-4 md:pb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 border-b pb-4 md:pb-6">
        {user.photo ? (
          <ImagePreview
            src={getPhotoUrl(user.photo, (user as any).updatedAt) || ''}
            alt={user.name}
            className="w-24 h-24 shrink-0"
            thumbnailClassName="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-primary/20"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-primary/80 rounded-full flex items-center justify-center shrink-0 text-primary-foreground font-bold text-3xl shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* <div className="flex flex-col md:text-left">
          <h3 className="text-2xl font-bold text-foreground text-center md:text-left leading-none pb-1 capitalize">{user.name?.toLowerCase()}</h3>

          <span className="text-muted-foreground inline-flex items-center break-all text-sm">
            <Mail className="w-4 h-4 shrink-0 mr-2" />
            <span>{user.email}</span>
          </span>
          <span className="text-muted-foreground inline-flex items-center break-all text-sm">
            <Phone className="w-4 h-4 shrink-0 mr-2" />
            <span>{user.mobile}</span>
          </span>
          {user.userType && (
            <span className="inline-flex items-center text-sm text-muted-foreground wrap-normal">
              <User className="w-4 h-4 shrink-0 mr-2" />
              <span>{user.userType.name}</span>
            </span>
          )}
          {user.office && (
            <span className="inline-flex items-center text-sm text-muted-foreground break-all">
              <Building className="w-4 h-4 shrink-0 mr-2" />
              <span>{user.office.name}</span>
            </span>
          )}
          <span className="inline-flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0 mr-2" />
            <span>Joined {formatDate(user.joiningDate)}</span>
          </span>
        </div> */}
        <div className="flex flex-col md:text-left">

          {/* Name */}
          <h3 className="text-2xl font-bold text-foreground text-center md:text-left leading-none pb-1 capitalize">
            {user.name?.toLowerCase()}
          </h3>

          {/* User Info */}
          <dl className="text-sm text-muted-foreground space-y-1">

            {/* Email */}
            <div className="flex items-center gap-2 min-w-0">
              <dt className="sr-only">Email</dt>
              <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
              <dd className="truncate" title={user.email}>
                <a
                  href={`mailto:${user.email}`}
                  aria-label={`Send email to ${user.email}`}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  {user.email}
                </a>
              </dd>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 min-w-0">
              <dt className="sr-only">Phone</dt>
              <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <dd title={user.mobile}>
                <a
                  href={`tel:${user.mobile}`}
                  aria-label={`Call ${formatPhone(user.mobile)}`}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  {formatPhone(user.mobile)}
                </a>
              </dd>
            </div>

            {/* User Type */}
            {user.userType && (
              <div className="flex items-center gap-2 min-w-0">
                <dt className="sr-only">User type</dt>
                <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                <dd title={user.userType.name}>
                  {user.userType.name}
                </dd>
              </div>
            )}

            {/* Office */}
            {user.office && (
              <div className="flex items-center gap-2 min-w-0">
                <dt className="sr-only">Office</dt>
                <Building className="w-4 h-4 shrink-0" aria-hidden="true" />
                <dd className="break-all" title={user.office.name}>
                  {user.office.name}
                </dd>
              </div>
            )}

            {/* Joining Date */}
            <div className="flex items-center gap-2">
              <dt className="sr-only">Joining date</dt>
              <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
              <dd>
                {formatDate(user.joiningDate)}
              </dd>
            </div>

          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3 md:space-y-4 h-full">
            <h4 className="text-lg leading-none font-bold text-primary mb-2">{t('users.profileDetails') || 'Profile Details'}</h4>
            <div className="grid grid-rows-2 gap-4">
              <div className='space-y-1'>
                <h4 className="text-base leading-none font-medium text-muted-foreground">{t('users.form.username')}</h4>
                <p className="text-sm leading-none font-medium">{user.username || '-'}</p>
              </div>
              <div className='space-y-1'>
                <h4 className="text-base leading-none font-medium text-muted-foreground">{t('users.form.address')}</h4>
                <p className="text-sm leading-none font-medium break-words leading-relaxed">{user.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3 md:space-y-4 h-full">
            <h4 className="text-lg leading-none font-bold text-primary mb-2">{t('users.compensationDetails') || 'Compensation Details'}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.ctc')}</p>
                <p className="text-sm leading-none font-semibold">{user.ctc ? formatCurrency(user.ctc) : '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.baseSalary')}</p>
                <p className="text-sm leading-none font-semibold">{user.baseSalary ? formatCurrency(user.baseSalary) : '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.travelAllowance')}</p>
                <p className="text-sm leading-none font-semibold">{(user.TA || user.ta) ? formatCurrency(user.TA || user.ta || 0) : '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.vpf')} %</p>
                <p className="text-sm leading-none font-semibold">{(user.VPF || user.vpf) ? (user.VPF || user.vpf) + '%' : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-3 md:space-y-4">
            <h4 className="text-lg leading-none font-bold text-primary mb-2">{t('users.form.bankAccountDetails')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.accountHolderName')}</p>
                <p className="text-sm leading-none font-medium">{user.accountDetails?.name || '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.accountNumber')}</p>
                <p className="text-sm leading-none font-medium">{user.accountDetails?.accountNumber || '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.ifscCode')}</p>
                <p className="text-sm leading-none font-medium">{user.accountDetails?.ifsc || '-'}</p>
              </div>
              <div className='space-y-1'>
                <p className="text-base leading-none text-muted-foreground">{t('users.form.upiId')}</p>
                <p className="text-sm leading-none font-medium break-words">{user.accountDetails?.upiId || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 md:gap-6 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-border -mb-4 md:-mb-6">
        <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          {t('users.editUser') || 'Edit Profile'}
        </Button>
        <Button onClick={onDelete} variant="danger" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          {t('users.deleteUser') || 'Delete User'}
        </Button>
      </div>
    </div>
  );
};
