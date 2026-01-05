'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchPageContent from './search-content';

// Wrapper to handle Suspense boundary for useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tìm kiếm...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
