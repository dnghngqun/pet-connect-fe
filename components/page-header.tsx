'use client';

import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function PageHeader({ title, description, icon, action }: PageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-orange-400 to-pink-500 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {icon && (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              {icon}
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {description && <p className="text-lg opacity-90 mb-6">{description}</p>}
          {action && (
            <Button size="lg" variant="secondary" onClick={action.onClick} className="shadow-lg">
              {action.label}
            </Button>
          )}
        </div>
      </div>
      {/* Decorative paw prints */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <span className="absolute top-4 right-[10%] text-3xl">🐾</span>
        <span className="absolute top-16 left-[15%] text-2xl">🐾</span>
        <span className="absolute bottom-8 right-[20%] text-2xl">🐾</span>
      </div>
    </div>
  );
}
