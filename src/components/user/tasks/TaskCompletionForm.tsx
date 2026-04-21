'use client';

import { useTranslations } from 'next-intl';
import { Button, Textarea, Input, Alert } from '@/components';

interface TaskCompletionFormProps {
  selectedAssignment: any;
  completionData: {
    remarks: string;
    photo: File | null;
  };
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearErrors: () => void;
}

export const TaskCompletionForm = ({
  selectedAssignment,
  completionData,
  errors,
  onSubmit,
  onCancel,
  onInputChange,
  onPhotoChange,
  clearErrors
}: TaskCompletionFormProps) => {
  const t = useTranslations();

  if (!selectedAssignment) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6" noValidate>
      {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
      
      <Textarea
        label={t('tasks.remarksOptional')}
        name="remarks"
        value={completionData.remarks}
        onChange={onInputChange}
        placeholder={t('tasks.addRemarks')}
        rows={3}
        error={errors.remarks}
      />

      <Input
        label={t('tasks.completionPhotoOptional')}
        type="file"
        accept=".jpg, .jpeg, .png"
        onChange={onPhotoChange}
        className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-10 py-2.5"
        error={errors.photo}
      />
      
      {selectedAssignment.task.type === 'Mandatory' && (
        <p className="text-xs text-destructive mt-1">
          * {t('tasks.photoRequiredForMandatory')}
        </p>
      )}

      <div className="flex justify-end gap-4 md:gap-6">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
        >
          {t('tasks.cancel')}
        </Button>
        <Button
          type="submit"
        >
          {t('tasks.completeTaskButton')}
        </Button>
      </div>
    </form>
  );
};
