import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '../lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const PAGE_SIZE = 15;

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found.', emptyIcon, onRowClick, exportFilename }) {
  const [page, setPage] = useState(0);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-foreground/[0.05]">
              {onRowClick && <th className="w-12 px-4 lg:px-6 py-4" />}
              {columns.map((col) => (
                <th key={col.key} className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 px-4 lg:px-6 py-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {onRowClick && <th className="w-12 px-4 lg:px-6 py-4" />}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-foreground/[0.03]">
                {onRowClick && <td className="px-4 lg:px-6 py-5" />}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 lg:px-6 py-5">
                    <div className="skeleton h-4 w-3/4">&nbsp;</div>
                  </td>
                ))}
                {onRowClick && <td className="px-4 lg:px-6 py-5" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="px-6 py-16 lg:py-20 text-center">
        {emptyIcon && <div className="flex justify-center mb-6 text-foreground/[0.06]">{emptyIcon}</div>}
        <p className="text-foreground/20 text-xs font-serif italic">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) =>
      columns.map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '';
        return String(val).replace(/"/g, '""');
      })
    );
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename || 'export'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-foreground/[0.05]">
              {onRowClick && (
                <th className="w-12 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 px-4 lg:px-6 py-4" />
              )}
              {columns.map((col) => (
                <th key={col.key} className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 px-4 lg:px-6 py-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {onRowClick && <th className="w-12 px-4 lg:px-6 py-4" />}
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {paginatedData.map((row, i) => (
              <motion.tr
                key={row.id || i}
                variants={itemVariants}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-foreground/[0.03] last:border-0 transition-all duration-500 group',
                  onRowClick && 'cursor-pointer hover:bg-foreground/[0.01]'
                )}
              >
                {onRowClick && (
                  <td className="px-4 lg:px-6 py-4 lg:py-5 w-12 text-[10px] font-mono text-foreground/10 group-hover:text-rentr-primary transition-colors">
                    {String(page * PAGE_SIZE + i + 1).padStart(3, '0')}
                  </td>
                )}
                {columns.map((col, ci) => (
                  <td key={col.key} className={cn(
                    'px-4 lg:px-6 py-4 lg:py-5 text-sm whitespace-nowrap transition-colors duration-300',
                    ci === 0
                      ? 'font-bold text-foreground group-hover:text-rentr-primary'
                      : 'text-foreground/40 group-hover:text-foreground/60'
                  )}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-4 lg:px-6 py-4 lg:py-5 w-12 text-right">
                    <ArrowRight className="w-4 h-4 text-foreground/[0.06] group-hover:text-rentr-primary group-hover:translate-x-1 transition-all duration-500 inline-block" />
                  </td>
                )}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Pagination & Export Footer */}
      {(totalPages > 1 || exportFilename) && (
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t border-foreground/[0.05]">
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
              {data.length} total &middot; Page {page + 1} of {totalPages}
            </p>
            {exportFilename && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-rentr-primary transition-colors"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 rounded-lg border border-foreground/[0.06] flex items-center justify-center text-foreground/30 hover:text-foreground hover:border-foreground/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx;
                } else if (page < 3) {
                  pageNum = idx;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-[10px] font-bold transition-all',
                      page === pageNum
                        ? 'bg-rentr-primary text-white'
                        : 'text-foreground/30 hover:text-foreground hover:bg-foreground/[0.03]'
                    )}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-8 h-8 rounded-lg border border-foreground/[0.06] flex items-center justify-center text-foreground/30 hover:text-foreground hover:border-foreground/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
