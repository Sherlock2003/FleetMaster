import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: 'Available' | 'Rented' | 'Maintenance';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Available: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    Rented: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    Maintenance: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };

  return (
    <span
      className={clsx(
        'px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
