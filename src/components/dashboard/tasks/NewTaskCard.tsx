'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ImagePreview } from '@/components/ImagePreview';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';

export type TaskStatus = 'in-progress' | 'pending' | 'completed';
export type TaskType = 'mandatory' | 'optional';
export type TaskFrequency = 'one-time' | 'daily' | 'weekly';

interface TaskUser {
  name: string;
  photo?: string;
  initials: string;
}

export interface TaskData {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  frequency: TaskFrequency;
  officeName: string;
  userType: string;
  creator: TaskUser;
  assignedBy?: TaskUser;
  assignedTo?: TaskUser;
}

interface NewTaskCardProps {
  task: TaskData;
  onManage?: (task: TaskData) => void;
}

const NewTaskCard: React.FC<NewTaskCardProps> = ({ task, onManage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'in-progress':
        return { label: 'IN PROGRESS', color: 'bg-primary', icon: <PlayCircle className="w-3 h-3 mr-1" /> };
      case 'pending':
        return { label: 'PENDING', color: 'bg-warning', icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" /> };
      case 'completed':
        return { label: 'COMPLETED', color: 'bg-secondary', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
      default:
        return { label: 'UNKNOWN', color: 'bg-gray-500', icon: null };
    }
  };

  const getTypeConfig = (type: TaskType) => {
    return type === 'mandatory'
      ? { label: 'MANDATORY', color: 'bg-destructive' }
      : { label: 'OPTIONAL', color: 'bg-secondary text-black' };
  };

  const getFrequencyConfig = (freq: TaskFrequency) => {
    const iconClass = "w-3 h-3 mr-1";
    switch (freq) {
      case 'one-time':
        return { label: 'ONE-TIME', color: 'bg-zinc-800', icon: <AlertCircle className={iconClass} /> };
      case 'daily':
        return { label: 'DAILY', color: 'bg-zinc-800', icon: <Clock className={iconClass} /> };
      case 'weekly':
        return { label: 'WEEKLY', color: 'bg-zinc-800', icon: <Calendar className={iconClass} /> };
      default:
        return { label: 'UNKNOWN', color: 'bg-zinc-800', icon: null };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const typeConfig = getTypeConfig(task.type);
  const freqConfig = getFrequencyConfig(task.frequency);

  const UserAvatar = ({ user, size = 'sm' }: { user: TaskUser, size?: 'sm' | 'md' }) => {
    const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    return user.photo ? (
      <img src={user.photo} alt={user.name} className={`${dim} rounded-full object-cover border-2 border-background shadow-sm`} />
    ) : (
      <div className={`${dim} rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold text-xs border-2 border-background shadow-sm`}>
        {user.initials}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden group flex flex-col border-border bg-card hover:shadow-xl transition-all duration-400 min-h-[440px] rounded-2xl" padding='none'>
      {/* Parallel Ribbon Stack (Top-Right) */}
      <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none z-10 overflow-hidden">
        {/* Status Ribbon (Top/Outer) */}
        <div className={`absolute top-[26px] right-[-100px] w-[280px] py-1 ${statusConfig.color} text-white text-[9px] font-bold text-center rotate-45 shadow-sm uppercase tracking-widest`}>
          {statusConfig.icon ? <span className="inline-block scale-75 mr-1">{statusConfig.icon}</span> : null}
          {statusConfig.label}
        </div>
        {/* Type Ribbon (Middle) */}
        <div className={`absolute top-[41px] right-[-85px] w-[280px] py-1 ${typeConfig.color} ${task.type === 'optional' ? 'text-black' : 'text-white'} text-[9px] font-bold text-center rotate-45 shadow-sm uppercase tracking-widest`}>
          {typeConfig.label}
        </div>
        {/* Frequency Ribbon (Inner) */}
        <div className={`absolute top-[56px] right-[-70px] w-[280px] py-1 ${freqConfig.color} text-white/90 text-[9px] font-bold text-center rotate-45 shadow-sm uppercase tracking-widest flex items-center justify-center`}>
          {freqConfig.icon ? <span className="inline-block scale-75 mr-1 text-white">{freqConfig.icon}</span> : null}
          {freqConfig.label}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 space-y-5">
        <div className="pr-28">
          <h3 className="text-xl font-bold text-foreground leading-tight">{task.name}</h3>
        </div>

        <div className="space-y-2 pr-12">
          <p className={`text-[13px] text-muted-foreground leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {task.description}
          </p>
          {task.description.length > 60 && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              See More
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground/70">{task.officeName}</span>
          <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wide">
            {task.userType}
          </span>
        </div>

        {/* Separator - Subtle Line as seen in image */}
        <div className="h-px bg-border/40 w-full" />

        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <UserAvatar user={task.creator} />
          <span className="text-[13px] text-muted-foreground font-medium">Created by {task.creator.name}</span>
        </div>

        {/* Assignees (As separate items as seen in image) */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {task.assignedBy && (<div className="flex items-center gap-3">
            <UserAvatar user={task.assignedBy} />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Assigned By</span>
              <span className="text-xs font-semibold text-foreground">{task.assignedBy.name}</span>
            </div>
          </div>)}
          {task.assignedTo && (<div className="flex items-center gap-3">
            <UserAvatar user={task.assignedTo} />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Assigned To</span>
              <span className="text-xs font-semibold text-foreground">{task.assignedTo.name}</span>
            </div>
          </div>)}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 pt-0">
        <Button
          variant="outline"
          className="w-full rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold py-6 text-base"
          onClick={() => onManage?.(task)}
        >
          Manage Task
        </Button>
      </div>
    </Card>
  );
};

export default NewTaskCard;
