import Clock from 'lucide-react/dist/esm/icons/clock';
import Target from 'lucide-react/dist/esm/icons/target';
import Award from 'lucide-react/dist/esm/icons/award';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import { Card, FormField } from '@/components';
import { useTranslations } from 'next-intl';

interface WorkInformationCardProps {
  user: any;
}

export const WorkInformationCard = ({ user }: WorkInformationCardProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6 space-y-4 md:space-y-6 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <Clock className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {t('userProfile.sections.workInformation')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('userProfile.labels.shiftTimings')}</p>
          <div className="flex items-center gap-2 text-foreground font-semibold p-3 border border-border/80 rounded-lg">
            <Clock className="w-4 h-4 text-secondary" />
            <span>{user.shiftTimings?.start || t('userProfile.defaults.shiftStart')} - {user.shiftTimings?.end || '18:00'}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('userProfile.labels.lateMinutesAllowed')}</p>
          <div className="flex items-center gap-2 text-foreground font-semibold p-3 border border-border/80 rounded-lg">
            <Target className="w-4 h-4 text-secondary" />
            <span>{user.allowedLateMinutes || 10} minutes</span>
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('userProfile.labels.yearsWithCompany')}</p>
          <div className="flex items-center gap-2 text-foreground font-semibold p-3 border border-border/80 rounded-lg">
            <Award className="w-4 h-4 text-secondary" />
            <span>
              {user.joiningDate && !isNaN(new Date(user.joiningDate).getTime())
                ? Math.floor((new Date().getTime() - new Date(user.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
                : 0} Years
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface BankDetailsCardProps {
  editing: boolean;
  editData: any;
  setEditData: (data: any) => void;
  user: any;
  errors: any;
}

export const BankDetailsCard = ({ editing, editData, setEditData, user, errors }: BankDetailsCardProps) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6 space-y-4 md:space-y-6 border-border/60 shadow-sm">
      <div className="flex items-center mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          <DollarSign className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {t('userProfile.sections.bankAccountDetails')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          name="accountHolderName"
          ringVariant="secondary"
          label={t('userProfile.labels.accountHolderName')}
          value={editing ? editData.accountDetails.name : (user.accountDetails?.name || '')}
          onChange={(e) => editing && setEditData({
            ...editData,
            accountDetails: { ...editData.accountDetails, name: e.target.value }
          })}
          placeholder={t('userProfile.placeholders.enterAccountHolderName')}
          disabled={!editing}
          className={!editing ? "p-3 bg-secondary/30 border border-border/60 rounded-lg pointer-events-none" : ""}
          error={errors.accountHolderName}
          autoComplete="off"
        />

        <FormField
          name="accountNumber"
          ringVariant="secondary"
          label={t('userProfile.labels.accountNumber')}
          value={editing ? editData.accountDetails.accountNumber : (user.accountDetails?.accountNumber || '')}
          onChange={(e) => editing && setEditData({
            ...editData,
            accountDetails: { ...editData.accountDetails, accountNumber: e.target.value }
          })}
          placeholder={t('userProfile.placeholders.enterAccountNumber')}
          disabled={!editing}
          className={!editing ? "p-3 bg-secondary/30 border border-border/60 rounded-lg pointer-events-none font-mono tracking-wider" : ""}
          error={errors.accountNumber}
          autoComplete="off"
        />

        <FormField
          name="ifscCode"
          ringVariant="secondary"
          label={t('userProfile.labels.ifscCode')}
          value={editing ? editData.accountDetails.ifsc : (user.accountDetails?.ifsc || '')}
          onChange={(e) => editing && setEditData({
            ...editData,
            accountDetails: { ...editData.accountDetails, ifsc: e.target.value }
          })}
          placeholder={t('userProfile.placeholders.enterIfscCode')}
          disabled={!editing}
          className={!editing ? "p-3 bg-secondary/30 border border-border/60 rounded-lg pointer-events-none uppercase" : ""}
          error={errors.ifscCode}
          autoComplete="off"
        />

        <FormField
          name="upiId"
          ringVariant="secondary"
          label={t('userProfile.labels.upiId')}
          value={editing ? editData.accountDetails.upiId : (user.accountDetails?.upiId || '')}
          onChange={(e) => editing && setEditData({
            ...editData,
            accountDetails: { ...editData.accountDetails, upiId: e.target.value }
          })}
          placeholder={t('userProfile.placeholders.enterUpiId')}
          disabled={!editing}
          className={!editing ? "p-3 bg-secondary/30 border border-border/60 rounded-lg pointer-events-none" : ""}
          error={errors.upiId}
          autoComplete="off"
        />
      </div>
    </Card>
  );
};
