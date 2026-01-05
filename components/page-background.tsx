"use client"

import { motion } from "framer-motion"
import { PawPrint, Bone, Heart } from "lucide-react"
import { useState, useEffect } from "react"

export default function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Background Gradient - Fixed at bottom layer */}
      <div 
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(135deg, #fbf7f4 0%, #f8f5f2 50%, #fbf7f4 100%)"
        }}
      />

      {/* Warm gradient blobs */}
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Floating Stickers (Paws, Bones, Hearts) - Lower opacity */}
      <FloatingSticker Icon={PawPrint} x="10%" y="20%" rotate={-15} duration={20} color="text-orange-200/20" size={40} />
      <FloatingSticker Icon={PawPrint} x="85%" y="15%" rotate={20} duration={25} color="text-amber-200/20" size={50} />
      <FloatingSticker Icon={Bone} x="20%" y="80%" rotate={45} duration={18} color="text-yellow-300/20" size={35} />
      <FloatingSticker Icon={Heart} x="80%" y="75%" rotate={-10} duration={22} color="text-red-200/20" size={30} />
      
      {/* Tiny particles - Validated client-side only */}
      <ParticleStickers count={5} />
    </div>
  )
}

function ParticleStickers({ count = 5 }: { count: number }) {
  const [stickers, setStickers] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles only on client to match hydration
    const newStickers = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 20
    }));
    setStickers(newStickers);
  }, [count]);

  if (stickers.length === 0) return null;

  return (
    <>
      {stickers.map((s) => (
        <FloatingSticker 
          key={s.id}
          Icon={PawPrint} 
          x={s.x}
          y={s.y} 
          rotate={s.rotate} 
          duration={s.duration} 
          color="text-orange-100/10" 
          size={s.size} 
        />
      ))}
    </>
  );
}


function FloatingSticker({ Icon, x, y, rotate, duration, color, size }: any) {
  return (
    <motion.div
      className={`absolute ${color}`}
      style={{ left: x, top: y }}
      initial={{ rotate: rotate }}
      animate={{
        y: [0, -20, 0],
        rotate: [rotate, rotate + 10, rotate],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon size={size} strokeWidth={2.5} />
    </motion.div>
  )
}

