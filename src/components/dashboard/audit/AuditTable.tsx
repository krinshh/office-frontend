'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/Card';
import Button from '@/components/Button';
import DraggableScroll from '@/components/DraggableScroll';
import Search from 'lucide-react/dist/esm/icons/search';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import User from 'lucide-react/dist/esm/icons/user';
import LogIn from 'lucide-react/dist/esm/icons/log-in';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash from 'lucide-react/dist/esm/icons/trash';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Calendar from 'lucide-react/dist/esm/icons/calendar';

interface AuditTableProps {
  logs: any[];
  loading: boolean;
  onRefresh: () => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const AuditTable = ({
  logs,
  loading,
  onRefresh,
  totalPages,
  currentPage,
  onPageChange
}: AuditTableProps) => {
  const t = useTranslations();

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'border border-primary text-primary';
      case 'mark_in':
        return 'border border-secondary text-secondary';
      case 'mark_out':
        return 'border border-warning text-warning';
      case 'generate_salary':
        return 'border border-secondary text-secondary';
      case 'update_hra_slab':
        return 'border border-primary text-primary';
      case 'create_hra_slab':
        return 'border border-secondary text-secondary';
      case 'delete_hra_slab':
        return 'border border-destructive text-destructive';
      case 'update_global_config':
        return 'border border-primary text-primary';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <LogIn className="w-3 h-3 mr-1" />;
      case 'mark_in': return <LogIn className="w-3 h-3 mr-1" />;
      case 'mark_out': return <LogOut className="w-3 h-3 mr-1" />;
      case 'generate_salary': return <DollarSign className="w-3 h-3 mr-1" />;
      case 'update_global_config': return <Settings className="w-3 h-3 mr-1" />;
      case 'update_hra_slab': return <Edit className="w-3 h-3 mr-1" />;
      case 'create_hra_slab': return <Plus className="w-3 h-3 mr-1" />;
      case 'delete_hra_slab': return <Trash className="w-3 h-3 mr-1" />;
      default: return <Activity className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center self-start sm:self-auto">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <Search className="w-6 h-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('audit.activityLogs')}</h2>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="primary"
          className="w-full sm:w-auto min-w-[120px] transition-all"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? `${t('audit.refresh')}...` : t('audit.refresh')}
        </Button>
      </div>

      <DraggableScroll className="rounded-xl border border-border">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.userName')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.action')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.resource')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.details')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.timestamp')}</th>
              <th className="py-4 px-6 font-semibold text-foreground">{t('audit.ip')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-20 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-40 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-muted rounded"></div></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-muted rounded"></div></td>
                </tr>
              ))
            ) : logs.map((log: any) => (
              <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                <td className="py-4 px-6 text-foreground">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-primary" /> {log.user?.name || t('audit.unknown')}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                    {getActionIcon(log.action)}
                    <span className="ml-1 capitalize">{log.action.replace(/_/g, ' ')}</span>
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="capitalize px-2 py-1 rounded border border-border text-muted-foreground text-xs font-medium">
                    {log.resource}
                  </span>
                </td>
                <td className="py-4 px-6 text-muted-foreground max-w-[200px]">
                  <div className="truncate text-xs font-mono p-1 rounded border border-border" title={log.details ? JSON.stringify(log.details, null, 2) : ''}>
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </div>
                </td>
                <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="py-4 px-6 text-muted-foreground text-xs font-mono">{log.ipAddress || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Activity className="w-12 h-12 mb-3 text-muted-foreground/30" />
                    <p>{t('audit.noAuditLogs')}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DraggableScroll>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground px-3 py-1 rounded-md border border-border">
            {t('audit.pageOf', { page: currentPage, total: totalPages })}
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-3 hover:bg-muted"
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-3 hover:bg-muted"
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
