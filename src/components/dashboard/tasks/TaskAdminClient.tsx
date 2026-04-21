'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Card from '@/components/Card';
import { EmptyTasks } from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { useTaskStore } from '@/lib/taskStore';
import { useAppStore } from '@/lib/appStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { StatusIndicator, ProgressIndicator } from './TaskIndicators';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import TasksLoading from '@/app/[locale]/dashboard/tasks/loading';
import PremiumTaskCard, { PremiumTaskData } from './PremiumTaskCard';

const Modal = dynamic(() => import('@/components/Modal'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted/20 rounded-lg animate-pulse" />,
});

interface Task {
  _id: string;
  name: string;
  description: string;
  office?: {
    _id: string;
    name: string;
  } | string;
  userCategory: {
    _id: string;
    name: string;
  } | string;
  frequency: string;
  expectedCompletionDateTime?: string;
  type: string;
  priority: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  recurringUntil?: string;
}

interface Assignment {
  _id: string;
  task: Task;
  assignedTo: {
    _id: string;
    name: string;
  }[];
  status: string;
  dueDate?: string;
  completedAt?: string;
}

export function TaskAdminClient() {
  const t = useTranslations();
  const {
    offices, userTypes, users,
    fetchOffices: storeFetchOffices,
    fetchUserTypes: storeFetchUserTypes,
    fetchUsers: storeFetchUsers
  } = useAppStore();

  const {
    tasks,
    assignments,
    fetchTasks: storeFetchTasks,
    fetchAssignments: storeFetchAssignments,
    isFetching,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { hasPermission } = usePermissions();
  const createAllowed = hasPermission(PERMISSIONS.TASKS_CREATE);
  const assignAllowed = hasPermission(PERMISSIONS.TASKS_ASSIGN);
  // const attendanceAccess = hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  // const taskAccess = hasPermission(PERMISSIONS.TASKS_VIEW_ALL);
  // const salaryAccess = hasPermission(PERMISSIONS.SALARY_VIEW_ALL);

  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    office: '',
    userCategory: '',
    frequency: 'One-Time',
    type: 'Mandatory',
    priority: 'Medium',
    recurringUntil: '',
  });

  const [assignData, setAssignData] = useState({
    assignedTo: [] as string[],
    dueDate: '',
  });

  const {
    errors,
    success,
    handleError,
    handleSuccess,
    clearErrors,
    setErrors,
    setSuccess
  } = useErrorHandler(t);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'assignedTo') {
      setAssignData(prev => ({ ...prev, assignedTo: [value] }));
    } else {
      setAssignData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fetchAssignments = async () => {
    try {
      await storeFetchAssignments();
    } catch (error) {
      handleError(error, t('apiErrors.fetchAssignmentsFailed'));
    }
  };

  const fetchTasks = async () => {
    try {
      await storeFetchTasks();
    } catch (error) {
      handleError(error, t('apiErrors.fetchTasksFailed'));
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedTask) return;

    clearErrors();

    if (assignData.assignedTo.length === 0) {
      handleError({ type: 'validation', field: 'assignedTo', message: t('tasks.pleaseSelectUserToAssign') });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.tasks.assign({
        taskId: selectedTask._id,
        assignedTo: assignData.assignedTo,
        dueDate: assignData.dueDate || undefined,
      });

      if (response.ok) {
        handleSuccess(t('tasks.taskAssignedSuccessfully'));
        setAssignData({ assignedTo: [], dueDate: '' });
        setShowAssignForm(false);
        setSelectedTask(null);
        fetchAssignments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, t('tasks.failedToAssignTask'));
      }
    } catch (error) {
      handleError(error, t('tasks.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const newErrors: Record<string, string> = {};

    if (!taskData.name.trim()) {
      newErrors.name = t('tasks.validation.nameRequired');
    } else if (taskData.name.length < 3 || taskData.name.length > 100) {
      newErrors.name = t('tasks.validation.nameLength');
    }

    if (!taskData.description.trim()) {
      newErrors.description = t('tasks.validation.descriptionRequired');
    } else if (taskData.description.length < 10 || taskData.description.length > 500) {
      newErrors.description = t('tasks.validation.descriptionLength');
    }

    if (!taskData.userCategory) newErrors.userCategory = t('tasks.validation.userCategoryRequired');
    if (!taskData.type) newErrors.type = t('tasks.validation.typeRequired');
    if (!taskData.frequency) newErrors.frequency = t('tasks.validation.frequencyRequired');
    if (!taskData.priority) newErrors.priority = t('tasks.validation.priorityRequired');
    if (!taskData.office) newErrors.office = t('tasks.validation.officeRequired');

    if ((taskData.frequency === 'Daily' || taskData.frequency === 'Weekly') && !taskData.recurringUntil) {
      newErrors.recurringUntil = t('tasks.validation.recurringEndDateRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.tasks.create({
        name: taskData.name,
        description: taskData.description,
        office: taskData.office,
        userCategory: taskData.userCategory,
        frequency: taskData.frequency,
        type: taskData.type,
        priority: taskData.priority,
        recurringUntil: taskData.recurringUntil,
      });

      if (response.ok) {
        handleSuccess(t('tasks.taskCreatedSuccessfully'));
        setTaskData({
          name: '',
          description: '',
          office: '',
          userCategory: '',
          frequency: 'One-Time',
          type: 'Mandatory',
          priority: 'Medium',
          recurringUntil: '',
        });
        setShowForm(false);
        fetchTasks();
        fetchAssignments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        handleError(errorData, t('tasks.failedToCreateTask'));
      }
    } catch (error) {
      handleError(error, t('tasks.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        storeFetchOffices(),
        storeFetchUserTypes(),
        storeFetchUsers(),
        storeFetchTasks(),
        storeFetchAssignments()
      ]);
    } catch (error) {
      handleError(error, t('apiErrors.unexpected'));
    }
  }, [storeFetchOffices, storeFetchUserTypes, storeFetchUsers, storeFetchTasks, storeFetchAssignments, handleError, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskAssignments = assignments.filter(a => a.task._id === task._id);
      return taskAssignments.length === 0 || taskAssignments.some(a => a.status !== 'Completed');
    });
  }, [tasks, assignments]);

  if (isFetching.tasks && tasks.length === 0) {
    return <TasksLoading />;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4 md:mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none pb-1">
            {t('tasks.taskManagementTitle')}
          </h1>
          <p className="text-muted-foreground leading-none pb-1">
            {t('tasks.taskManagementSubtitle')}
          </p>
        </div>
        {createAllowed && (<Button
          onClick={() => {
            clearErrors();
            setShowForm(!showForm);
          }}
          variant={showForm ? 'outline' : 'primary'}
          className="flex-row items-center justify-center gap-2 px-3 sm:px-4 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="text-sm whitespace-nowrap leading-none">
            {showForm ? t('tasks.cancel') : t('tasks.createTask')}
          </span>
        </Button>)}
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />}

      {/* Create Task Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          clearErrors();
          setShowForm(false);
        }}
        title={t('tasks.createNewTask')}
        size="xl"
        scrollable
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4 md:space-y-6" noValidate autoComplete="off">
          {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label={<span>{t('tasks.taskName')} <span className="text-destructive">*</span></span>}
              name="name"
              value={taskData.name}
              onChange={handleInputChange}
              placeholder={t('tasks.enterTaskName')}
              required
              error={errors.name}
              autoComplete="off"
            />


            <Select
              label={<span>{t('tasks.taskType')} <span className="text-destructive">*</span></span>}
              name="type"
              value={taskData.type}
              onChange={handleInputChange}
              options={[
                { value: 'Mandatory', label: t('tasks.mandatory') },
                { value: 'Optional', label: t('tasks.optional') }
              ]}
              placeholder={t('tasks.selectType')}
              required
              error={errors.type}
              autoComplete="off"
            />

            <Select
              label={<span>{t('tasks.office')} <span className="text-destructive">*</span></span>}
              name="office"
              value={taskData.office}
              onChange={handleInputChange}
              options={offices.filter(o => o.isActive !== false).map(office => ({
                value: office._id,
                label: office.name
              }))}
              placeholder={t('tasks.selectOfficePlaceholder')}
              required
              error={errors.office}
              autoComplete="off"
            />

            <Select
              label={<span>{t('tasks.userCategory')} <span className="text-destructive">*</span></span>}
              name="userCategory"
              value={taskData.userCategory}
              onChange={handleInputChange}
              options={userTypes.filter(type => type.isActive !== false).map(type => ({
                value: type._id,
                label: type.name
              }))}
              placeholder={t('tasks.selectUserTypePlaceholder')}
              required
              error={errors.userCategory}
              autoComplete="off"
            />

            <div className="md:col-span-2">
              <Textarea
                label={<span>{t('tasks.taskDescription')} <span className="text-destructive">*</span></span>}
                name="description"
                value={taskData.description}
                onChange={handleInputChange}
                placeholder={t('tasks.describeRequirements')}
                rows={3}
                required
                error={errors.description}
                autoComplete="off"
              />
            </div>

            <Select
              label={<span>{t('tasks.frequency')} <span className="text-destructive">*</span></span>}
              name="frequency"
              value={taskData.frequency}
              onChange={handleInputChange}
              options={[
                { value: 'Daily', label: t('tasks.daily') },
                { value: 'Weekly', label: t('tasks.weekly') },
                { value: 'One-Time', label: t('tasks.oneTime') }
              ]}
              placeholder={t('tasks.selectFrequency')}
              required
              error={errors.frequency}
              autoComplete="off"
            />

            {(taskData.frequency === 'Daily' || taskData.frequency === 'Weekly') && (
              <Input
                label={<span>{t('tasks.recurringUntil')} <span className="text-destructive">*</span></span>}
                type="date"
                name="recurringUntil"
                value={taskData.recurringUntil}
                onChange={handleInputChange}
                placeholder={t('tasks.recurringUntilPlaceholder')}
                min={new Date().toISOString().split('T')[0]}
                required
                error={errors.recurringUntil}
                autoComplete="off"
              />
            )}

            <Select
              label={<span>{t('tasks.priority')} <span className="text-destructive">*</span></span>}
              name="priority"
              value={taskData.priority}
              onChange={handleInputChange}
              options={[
                { value: 'High', label: t('tasks.high') },
                { value: 'Medium', label: t('tasks.medium') },
                { value: 'Low', label: t('tasks.low') }
              ]}
              placeholder={t('tasks.selectPriority')}
              required
              error={errors.priority}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => {
                clearErrors();
                setShowForm(false);
              }}
              variant="outline"
            >
              {t('tasks.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {t('tasks.createTaskButton')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={!!(showAssignForm && selectedTask)}
        onClose={() => {
          clearErrors();
          setShowAssignForm(false);
          setSelectedTask(null);
          setAssignData({ assignedTo: [], dueDate: '' });
        }}
        title={selectedTask ? t('tasks.assignTask', { taskName: selectedTask.name }) : ''}
        size="xl"
        scrollable
      >
        {selectedTask && (
          <form onSubmit={handleAssignSubmit} className="space-y-4 md:space-y-6" noValidate autoComplete="off">
            {errors.general && <Alert type="error" message={errors.general} onClose={() => clearErrors()} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Select
                label={<span>{t('tasks.assignTo')} <span className="text-destructive">*</span></span>}
                name="assignedTo"
                value={assignData.assignedTo[0] || ''}
                onChange={handleAssignInputChange}
                options={users
                  .filter((user) => {
                    const taskUserTypeId = typeof selectedTask.userCategory === 'string'
                      ? selectedTask.userCategory
                      : selectedTask.userCategory?._id;
                    const userUserTypeId = typeof user.userType === 'string'
                      ? user.userType
                      : user.userType?._id;

                    if (userUserTypeId?.toString() !== taskUserTypeId?.toString()) return false;
                    if (user.isActive === false) return false;

                    if (selectedTask.office) {
                      const taskOfficeId = typeof selectedTask.office === 'string'
                        ? selectedTask.office
                        : selectedTask.office?._id;
                      const userOfficeId = typeof user.office === 'string'
                        ? user.office
                        : user.office?._id;

                      if (!userOfficeId) return false;
                      if (userOfficeId.toString() !== taskOfficeId?.toString()) return false;
                    }
                    return true;
                  })
                  .map((user) => ({
                    value: user._id,
                    label: user.name
                  }))}
                placeholder={t('tasks.selectUser')}
                required
                error={errors.assignedTo}
                autoComplete="off"
              />

              <div className="space-y-1">
                <Input
                  label={<span>{t('tasks.dueDate')} <span className="text-secondary text-xs">({t('tasks.optional')})</span></span>}
                  type="date"
                  name="dueDate"
                  value={assignData.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleAssignInputChange}
                  error={errors.dueDate}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {t('tasks.helpers.dueDateDefaults')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  clearErrors();
                  setShowAssignForm(false);
                  setSelectedTask(null);
                  setAssignData({ assignedTo: [], dueDate: '' });
                }}
                variant="outline"
              >
                {t('tasks.cancel')}
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('tasks.assignTaskButton')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 md:gap-6 lg:gap-8 auto-rows-min">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => {
          const officeId = typeof task.office === 'string' ? task.office : task.office?._id;
          const categoryId = typeof task.userCategory === 'string' ? task.userCategory : task.userCategory?._id;
          const officeName = typeof task.office === 'object' ? task.office?.name : offices.find(o => o._id === officeId)?.name;
          const categoryName = typeof task.userCategory === 'object' ? task.userCategory?.name : userTypes.find(ut => ut._id === categoryId)?.name;
          const taskAssignments = assignments.filter(a => a.task._id === task._id);
          const latestAssignment = taskAssignments.length > 0 ? taskAssignments[0] : null;

          const premiumTask: PremiumTaskData = {
            id: task._id,
            name: task.name,
            description: task.description,
            status: latestAssignment ? latestAssignment.status : 'Pending',
            priority: task.priority,
            type: task.type,
            frequency: task.frequency,
            officeName,
            categoryName,
            dueDate: latestAssignment?.dueDate,
            createdAt: task.createdAt,
            createdBy: task.createdBy ? {
              name: task.createdBy.name,
              initials: task.createdBy.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            } : undefined,
            assignedBy: latestAssignment?.assignedBy ? {
              name: (latestAssignment.assignedBy as any).name,
              initials: (latestAssignment.assignedBy as any).name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              photo: (latestAssignment.assignedBy as any).photo
            } : undefined,
            assignedTo: latestAssignment?.assignedTo?.map(u => ({
              name: u.name,
              initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
              photo: (u as any).photo
            })) || [],
          };

          return (
            <PremiumTaskCard
              key={task._id}
              task={premiumTask}
              t={t}
              manageLabel={taskAssignments.length > 0 ? t('tasks.manage') : t('tasks.assign')}
              onManage={() => {
                if (!assignAllowed) return;
                setErrors({});
                setSelectedTask(task);
                if (latestAssignment) {
                  setAssignData({
                    assignedTo: latestAssignment.assignedTo.map((u: any) => u._id),
                    dueDate: latestAssignment.dueDate ? new Date(latestAssignment.dueDate).toISOString().split('T')[0] : ''
                  });
                } else {
                  setAssignData({ assignedTo: [], dueDate: '' });
                }
                setShowAssignForm(true);
              }}
            />
          );
        }) : (
          <div className="col-span-full flex justify-center min-h-[60vh]">
            <EmptyTasks
              isAdmin={true}
              onCreateTask={() => setShowForm(true)}
            />
          </div>
        )}
      </div>
    </div >
  );
}
