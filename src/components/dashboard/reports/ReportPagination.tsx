'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const ReportPagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) => {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground px-3 py-1 rounded-md border border-border">
        {t('pageOf', { page: currentPage, total: totalPages })}
      </div>
      <div className="flex space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-3 hover:bg-muted"
        >
          {tCommon('previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-3 hover:bg-muted"
        >
          {tCommon('next')}
        </Button>
      </div>
    </div>
  );
};
