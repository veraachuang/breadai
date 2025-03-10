'use client';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c6644]"></div>
    </div>
  );
} 