"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LeftSidebarProps {
  user: any;
  currentPet: any;
}

export function LeftSidebar({ user, currentPet }: LeftSidebarProps) {
  const router = useRouter();

  if (!user) return null;

  return (
    <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
      {/* Identity Card */}
      <div className="bg-card rounded-2xl shadow-soft p-6 flex flex-col items-center text-center relative overflow-hidden group border border-border">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-sky-100/40 dark:from-sky-900/40 to-transparent"></div>
        <div className="relative z-10 w-28 h-28 rounded-full p-1 bg-card shadow-sm mb-4 transition-transform group-hover:scale-105 duration-300">
          <div 
            className="w-full h-full rounded-full bg-cover bg-center" 
            style={{ backgroundImage: `url('${currentPet?.image || user.avatarUrl || "https://i.pravatar.cc/150"}')` }}
          ></div>
          <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-card" title="Online"></div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{currentPet?.name || user.fullName}</h2>
        <p className="text-primary font-medium text-sm mb-3">
            {currentPet?.type ? `${currentPet.type} • ${currentPet.breed || "Pet"}` : "Pet Lover"}
        </p>

        {/* Bio Pill */}
        <div className="bg-accent/50 rounded-xl p-3 w-full mb-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
             {currentPet?.bio || "Professional napper, ball chaser, and good boy. Will work for treats. 🦴"}
          </p>
        </div>

        <div className="flex w-full gap-2">
          <div className="flex-1 flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <span className="font-bold text-lg text-foreground">1.2k</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Pals</span>
          </div>
          <div className="w-px bg-border"></div>
          <div className="flex-1 flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
            <span className="font-bold text-lg text-foreground">458</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Barks</span>
          </div>
        </div>
      </div>

      {/* Switch Profile Widget */}
      <div className="bg-card rounded-2xl shadow-soft overflow-hidden border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Switch Profile</h3>
        </div>
        <div className="p-2 space-y-1">
          {/* Active Item */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/10 border border-primary/20 cursor-default">
            <div 
                className="w-10 h-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${currentPet?.image || user.avatarUrl}')` }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{currentPet?.name || user.fullName}</p>
              <p className="text-xs text-primary truncate">Active now</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          </div>

          {/* Add New */}
          <button 
            onClick={() => router.push('/select-pet')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left text-muted-foreground hover:text-primary"
          >
             <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
             </div>
             <span className="text-sm font-medium">Switch / Add Pet</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
