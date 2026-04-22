import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Camera from 'lucide-react/dist/esm/icons/camera';
import { Card, FormField, ImagePreview, Select, Input } from '@/components';
import { useTranslations } from 'next-intl';
import { formatPhone, getPhotoUrl } from '@/utils/formatters';
import { VALID_REGEX } from '@/constants/regex';

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

interface ProfileSidebarProps {
  user: any;
  editing: boolean;
  editData: any;
  setEditData: (data: any) => void;
  previewUrl: string | null;
  onFileClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: any;
  setErrors: (errors: any) => void;
}

export const ProfileSidebar = ({
  user,
  editing,
  editData,
  setEditData,
  previewUrl,
  onFileClick,
  fileInputRef,
  handleFileChange,
  errors,
  setErrors
}: ProfileSidebarProps) => {
  const t = useTranslations();

  return (
    <Card className="lg:col-span-1 border-t-4 border-t-secondary h-fit" padding="none">
      <div className="flex flex-col items-center p-4 md:p-6">
        <div className="relative group">
          {previewUrl || user.photo ? (
            <ImagePreview
              src={previewUrl || getPhotoUrl(user.photo, user.updatedAt) || ''}
              alt={user.name}
              className="w-32 h-32 mb-4 md:mb-6"
              thumbnailClassName="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/40 flex items-center justify-center mb-4 text-4xl font-bold text-secondary border-4 border-background shadow-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {editing && (
            <div
              className="absolute bottom-0 right-0 p-2 bg-secondary text-secondary-foreground rounded-full shadow-lg cursor-pointer hover:bg-secondary/90 transition-all duration-200 z-10"
              onClick={onFileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onFileClick();
                }
              }}
              aria-label={t('userProfile.buttons.changePhoto')}
            >
              <Camera className="w-5 h-5" />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">{user.name}</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full border border-secondary/80 text-secondary text-sm font-medium">
            {user.userType?.name || t('userProfile.labels.employee')}
          </span>
        </div>

        <div className="mt-6 w-full space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg border border-border/80">
            <Mail className="w-4 h-4 text-secondary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">{t('userProfile.labels.email')}</p>
              <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg border border-border/80">
            <Phone className="w-4 h-4 text-secondary" />
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">{t('userProfile.labels.mobile')}</p>
                  <div className="flex gap-2">
                    <div className="w-[85px] shrink-0">
                      <Select
                        options={COUNTRY_CODES}
                        ringVariant="secondary"
                        value={COUNTRY_CODES.find(c => editData.mobile.startsWith(c.value))?.value || '+91'}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          const currentVal = editData.mobile || '';
                          // Find the longest matching code to slice correctly (e.g., +971 vs +9)
                          const matchedCode = [...COUNTRY_CODES]
                            .sort((a, b) => b.value.length - a.value.length)
                            .find(c => currentVal.startsWith(c.value))?.value || '';
                          
                          const mainNumber = matchedCode ? currentVal.slice(matchedCode.length) : currentVal.replace(VALID_REGEX.NON_DIGIT, '');
                          setEditData({ ...editData, mobile: newCode + mainNumber });
                        }}
                        fullWidth={true}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="tel"
                        ringVariant="secondary"
                        placeholder="XXX-XXX-XXXX"
                        value={(() => {
                          const currentVal = editData.mobile || '';
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
                          const currentVal = editData.mobile || '';
                          const code = [...COUNTRY_CODES]
                            .sort((a, b) => b.value.length - a.value.length)
                            .find(c => currentVal.startsWith(c.value))?.value || '+91';
                          setEditData({ ...editData, mobile: code + rawVal });
                        }}
                        error={errors.mobile}
                        fullWidth={true}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">{t('userProfile.labels.mobile')}</p>
                  <p className="text-sm font-semibold text-foreground">{formatPhone(user.mobile)}</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg border border-border/80">
            <MapPin className="w-4 h-4 text-secondary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">{t('userProfile.labels.office')}</p>
              <p className="text-sm font-semibold text-foreground">{user.office?.name || t('common.notAvailable')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg border border-border/80">
            <Calendar className="w-4 h-4 text-secondary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">{t('userProfile.labels.joiningDate')}</p>
              <p className="text-sm font-semibold text-foreground">
                {user.joiningDate && !isNaN(new Date(user.joiningDate).getTime())
                  ? new Date(user.joiningDate).toLocaleDateString()
                  : t('common.notAvailable')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
