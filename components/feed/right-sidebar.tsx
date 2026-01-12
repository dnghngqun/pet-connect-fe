"use client";

import React from "react";
import Link from "next/link";

export function RightSidebar() {
  return (
    <aside className="hidden xl:block xl:col-span-3 space-y-6">
      {/* Upcoming Events */}
      <div className="bg-card rounded-2xl shadow-soft p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg">Upcoming Events</h3>
          <Link href="/events" className="text-xs font-bold text-primary hover:underline">See All</Link>
        </div>
        <div className="space-y-4">
          {/* Event 1 */}
          <div className="flex gap-3 group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl shrink-0 text-blue-700 dark:text-blue-300">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sat</span>
              <span className="text-lg font-bold leading-none">12</span>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors leading-tight">Puppy Yoga</h4>
              <p className="text-xs text-muted-foreground mt-0.5">10:00 AM • Yoga Studio A</p>
            </div>
          </div>
          {/* Event 2 */}
          <div className="flex gap-3 group cursor-pointer hover:bg-muted/30 p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-xl shrink-0 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sun</span>
              <span className="text-lg font-bold leading-none">13</span>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors leading-tight">Frisbee Championship</h4>
              <p className="text-xs text-muted-foreground mt-0.5">2:00 PM • Westside Park</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Friends (Mini) */}
      <div className="bg-card rounded-2xl shadow-soft p-5 border border-border">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-4">You might know</h3>
        <div className="flex items-center gap-3 mb-3">
           <div className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200"></div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold text-foreground">Spot</p>
             <p className="text-xs text-muted-foreground">Dalmatian</p>
           </div>
           <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
             <span className="material-symbols-outlined text-[20px]">person_add</span>
           </button>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200"></div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold text-foreground">Rover</p>
             <p className="text-xs text-muted-foreground">Beagle</p>
           </div>
           <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
             <span className="material-symbols-outlined text-[20px]">person_add</span>
           </button>
        </div>
      </div>
    </aside>
  );
}
