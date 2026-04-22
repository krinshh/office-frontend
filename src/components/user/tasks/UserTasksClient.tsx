'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useTaskStore } from '@/lib/taskStore';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import Alert from '@/components/Alert';
import Loading from '@/components/Loading';
import { EmptyTasks } from '@/components/EmptyState';

import { UserTaskCard } from './UserTaskCard';
import { TaskCompletionForm } from './TaskCompletionForm';

const Modal = dynamic(() => import('@/components/Modal'), {
  loading: () => <Loading type="spinner" />,
  ssr: false
});

export function UserTasksClient() {
  const { user } = useAuthStore();
  const t = useTranslations();
  const {
    fetchOffices,
    fetchUserTypes,
    fetchUsers
  } = useAppStore();

  const {
    assignments,
    fetchTasks,
    fetchAssignments,
  } = useTaskStore();

  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [completionData, setCompletionData] = useState({
    remarks: '',
    photo: null as File | null,
  });

  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const {
    errors,
    success,
    loading,
    setLoading,
    handleError,
    handleSuccess,
    clearErrors,
    setErrors,
    setSuccess
  } = useErrorHandler(t);

  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      await Promise.all([
        fetchOffices(),
        fetchUserTypes(),
        fetchUsers(),
        fetchTasks(),
        fetchAssignments()
      ]);
    } catch (error) {
      handleError(error, t('apiErrors.unexpected'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, fetchOffices, fetchUserTypes, fetchUsers, fetchTasks, fetchAssignments, handleError, setLoading, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, setSuccess]);

  const updateAssignmentStatus = async (assignmentId: string, status: string, remarks?: string, photoProof?: string) => {
    setLoadingActions(prev => new Set(prev).add(assignmentId));
    try {
      const data: any = { status };
      if (remarks) data.remarks = remarks;
      if (photoProof) data.photoProof = photoProof;

      const response = await api.tasks.updateAssignmentStatus(assignmentId, data);
      if (response.ok) {
        handleSuccess(t('tasks.taskStatusUpdatedSuccessfully'));
        fetchAssignments(true);
      } else {
        handleError(await response.json().catch(() => ({})), t('tasks.failedToUpdateTaskStatus'));
      }
    } catch (error) {
      handleError(error, t('tasks.networkError'));
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    clearErrors();

    const newErrors: Record<string, string> = {};
    if (completionData.remarks && completionData.remarks.length > 200) {
      newErrors.remarks = t('tasks.validation.remarksLength');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (completionData.photo) {
        const reader = new FileReader();
        reader.onload = async () => {
          const photoProof = reader.result as string;
          await updateAssignmentStatus(selectedAssignment._id, 'Completed', completionData.remarks, photoProof);
          setShowCompleteForm(false);
          setSelectedAssignment(null);
          setCompletionData({ remarks: '', photo: null });
        };
        reader.readAsDataURL(completionData.photo);
      } else {
        await updateAssignmentStatus(selectedAssignment._id, 'Completed', completionData.remarks);
        setShowCompleteForm(false);
        setSelectedAssignment(null);
        setCompletionData({ remarks: '', photo: null });
      }
    } catch (err) {
      handleError(err, t('tasks.networkError'));
    }
  };

  const filteredTasks = useMemo(() => {
    return Array.from(new Map(
      assignments
        .filter(a => a.assignedTo.some(u => u._id === user?.id) && a.status !== 'Completed')
        .map(a => [a.task._id, a.task])
    ).values());
  }, [assignments, user?.id]);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">{t('tasks.myTasksTitle')}</h1>
          <p className="text-muted-foreground leading-none pb-1">{t('tasks.myTasksSubtitle')}</p>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}



      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-6 lg:gap-8">
        {(filteredTasks.length > 0) ? (
          filteredTasks.map((task: any) => {
            const myAssignment = assignments.find(a => a.task._id === task._id && a.assignedTo.some(u => u._id === user?.id));
            return (
              <UserTaskCard
                key={task._id}
                task={task}
                myAssignment={myAssignment}
                loadingActions={loadingActions}
                onStart={(id) => updateAssignmentStatus(id, 'In Progress')}
                onComplete={(a) => {
                  setErrors({});
                  setSelectedAssignment(a);
                  setShowCompleteForm(true);
                }}
              />
            );
          })
        ) : !loading && (
          <div className="col-span-full flex justify-center min-h-[60vh]">
            <EmptyTasks isAdmin={false} />
          </div>
        )}
      </div>

      <Modal
        isOpen={!!(showCompleteForm && selectedAssignment)}
        onClose={() => {
          clearErrors();
          setShowCompleteForm(false);
          setSelectedAssignment(null);
          setCompletionData({ remarks: '', photo: null });
        }}
        title={selectedAssignment ? t('tasks.completeTask', { taskName: selectedAssignment.task.name }) : ''}
        size="lg"
        scrollable={true}
      >
        <TaskCompletionForm
          selectedAssignment={selectedAssignment}
          completionData={completionData}
          errors={errors}
          clearErrors={clearErrors}
          onCancel={() => {
            setShowCompleteForm(false);
            setSelectedAssignment(null);
            setCompletionData({ remarks: '', photo: null });
          }}
          onInputChange={(e) => setCompletionData(prev => ({ ...prev, remarks: e.target.value }))}
          onPhotoChange={(e) => {
            const file = e.target.files?.[0] || null;
            if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
              setErrors({ photo: t('tasks.photoInvalid') });
              return;
            }
            setCompletionData(prev => ({ ...prev, photo: file }));
          }}
          onSubmit={handleCompleteSubmit}
        />
      </Modal>
    </div>
  );
}
