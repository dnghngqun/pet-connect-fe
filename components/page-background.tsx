"use client"

import { motion } from "framer-motion"

export default function PageBackground() {
  return (
    <>
      {/* Background image with overlay */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2000&auto=format&fit=crop')`,
          }}
        ></div>
        {/* Warm gradient overlay - soft and friendly */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800/20 via-red-800/20 to-pink-800/20 dark:from-orange-950/35 dark:via-red-950/35 dark:to-pink-950/35"></div>
        {/* Light overlay for better readability */}
        <div className="absolute inset-0 bg-white/75 dark:bg-black/55"></div>
      </div>

      {/* Animated background shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-orange-400/12 dark:bg-orange-500/8 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-400/12 dark:bg-red-500/8 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/12 dark:bg-pink-500/8 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
        />
      </div>
    </>
  )
}

