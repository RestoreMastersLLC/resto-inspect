import React from "react";

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
};

const Suspense = ({ children }: { children: React.ReactNode }) => {
  return <React.Suspense fallback={<LoadingFallback />}>{children}</React.Suspense>;
};

export default Suspense;
