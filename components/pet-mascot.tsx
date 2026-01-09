"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function PetMascot() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [direction, setDirection] = useState(1) // 1 = right, -1 = left
  
  // Random walk logic
  useEffect(() => {
    // Initial position - Bottom right
    if (typeof window !== 'undefined') {
      setPosition({ 
        x: window.innerWidth - 120, 
        y: window.innerHeight - 120 
      })
    }

    const movePet = () => {
      // Get viewport dimensions
      const maxX = window.innerWidth - 120
      const maxY = window.innerHeight - 120
      
      const newX = Math.max(20, Math.random() * maxX)
      const newY = Math.max(20, Math.random() * maxY)
      
      setPosition(prev => {
        setDirection(newX > prev.x ? 1 : -1)
        return { x: newX, y: newY }
      })
    }

    // Move immediately after a short delay
    setTimeout(movePet, 1000)

    const interval = setInterval(movePet, 8000) // Move every 8 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="fixed z-[999999999] pointer-events-none"
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        duration: 4,
        ease: "easeInOut"
      }}
    >
      <div className={`relative w-24 h-24 transform transition-transform duration-500 ${direction === -1 ? 'scale-x-[-1]' : ''}`}>
        {/* Animated Dog SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {/* Body */}
            <path d="M25,60 Q20,50 35,45 L65,45 Q85,50 80,70 L75,85 L25,85 Z" fill="#D97706" />
            
            {/* Head */}
            <g transform="translate(65, 30)">
              <ellipse cx="10" cy="10" rx="15" ry="14" fill="#F59E0B" />
              {/* Ears */}
              <path d="M-5,0 L-5,-15 L5,0 Z" fill="#D97706" transform="rotate(-20)" />
              <path d="M25,0 L25,-15 L15,0 Z" fill="#D97706" transform="rotate(20)" />
              {/* Eyes */}
              <circle cx="5" cy="8" r="2" fill="#000" />
              <circle cx="15" cy="8" r="2" fill="#000" />
              {/* Nose */}
              <ellipse cx="10" cy="14" rx="3" ry="2" fill="#000" />
              {/* Tongue */}
              <path d="M8,18 Q10,24 12,18" stroke="#EF4444" strokeWidth="2" fill="none" />
            </g>

            {/* Tail */}
            <motion.path 
              d="M25,55 Q10,40 15,30" 
              stroke="#D97706" 
              strokeWidth="6" 
              strokeLinecap="round"
              fill="none"
              animate={{ rotate: [0, 20, 0, -20, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ originX: "25px", originY: "55px" }}
            />
            
            {/* Legs */}
            <path d="M30,85 L30,95" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
            <path d="M45,85 L45,95" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
            <path d="M60,85 L60,95" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
            <path d="M70,85 L70,95" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  )
}
