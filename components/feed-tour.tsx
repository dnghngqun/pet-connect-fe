'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Filter, PenSquare } from 'lucide-react';

const STEPS = [
  {
    title: 'Khám phá bảng tin',
    desc: 'Lướt feed giống Facebook với bộ lọc type/tag và tìm kiếm nhanh.',
    icon: Sparkles,
    target: '#feed-filters',
  },
  {
    title: 'Tương tác ngay',
    desc: 'Thả cảm xúc, lưu, chia sẻ hoặc báo cáo bài đăng chỉ với một chạm.',
    icon: Filter,
    target: '#feed-list',
  },
  {
    title: 'Đăng bài đa loại',
    desc: 'Tạo LOST/ADOPTION/REVIEW/Q&A... kèm tag và meta theo wizard.',
    icon: PenSquare,
    target: '#create-post-cta',
  },
];

export default function FeedTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const calculateSpotlight = useCallback((target?: string) => {
    if (!target) {
      setSpotlight(null);
      return;
    }
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) {
      setSpotlight(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - 12;
    const left = rect.left + window.scrollX - 12;
    setSpotlight({
      top,
      left,
      width: rect.width + 24,
      height: rect.height + 24,
    });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem('pc-feed-tour');
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const advance = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem('pc-feed-tour', 'done');
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    calculateSpotlight(STEPS[step].target);
    const handleResize = () => calculateSpotlight(STEPS[step].target);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, step, calculateSpotlight]);

  if (!open) return null;

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none fixed border-2 border-primary/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}
      <Card className="max-w-md w-full shadow-2xl relative z-10">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <CurrentIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Hướng dẫn nhanh</p>
              <h3 className="text-xl font-bold">{STEPS[step].title}</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{STEPS[step].desc}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Bước {step + 1}/{STEPS.length}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { localStorage.setItem('pc-feed-tour', 'skip'); setOpen(false); }}>
                Bỏ qua
              </Button>
              <Button size="sm" onClick={advance}>
                {step === STEPS.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
