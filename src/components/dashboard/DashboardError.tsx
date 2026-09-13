import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  message = 'تعذر تحميل بعض بياناتك حالياً، يرجى المحاولة مرة أخرى',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-3xl p-6 text-center my-6 max-w-lg mx-auto">
      <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto mb-2.5" />
      <h3 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200">
        تعذر استكمال الاتصال بقاعدة البيانات
      </h3>
      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 mb-4">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 mx-auto cursor-pointer transition-colors shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>إعادة المحاولة</span>
      </button>
    </div>
  );
};
