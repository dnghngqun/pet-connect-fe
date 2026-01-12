"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import Head from "next/head"
import { useSearchParams } from "next/navigation"
import authService from "@/services/authService"

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get("email") || ""
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ mã OTP",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.verifyOtp(email, otpCode)
      
      toast({
        title: "Thành công",
        description: "Mã xác thực hợp lệ",
        variant: "default",
      })
      
      // Redirect to reset password page
      window.location.href = `/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Mã xác thực không hợp lệ",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      // TODO: Call API to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTimeLeft(120)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      
      toast({
        title: "Thành công",
        description: "Mã xác thực mới đã được gửi",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi lại mã",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>

      <div className="flex-1 flex items-center justify-center w-full p-4 lg:p-8 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#faf8f5] dark:bg-[#221410]">
        <div className="w-full max-w-md bg-white dark:bg-[#2A1D1A] rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] p-8 md:p-10 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f05324]/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFEB99]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center size-16 bg-[#f05324]/20 text-[#f05324] rounded-full mb-6">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h1 className="text-[#1c110d] dark:text-white text-3xl font-bold mb-3 tracking-tight">
              Kiểm tra hộp thư của bạn
            </h1>
            <p className="text-[#9b5d4b] dark:text-gray-400 text-base leading-relaxed">
              Chúng tôi đã gửi mã xác thực đến email của bạn.<br/>
              Mã sẽ hết hạn sau <span className="font-bold text-[#1c110d] dark:text-white">{formatTime(timeLeft)}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-14 text-center text-2xl font-bold text-[#1c110d] dark:text-white bg-gray-50 dark:bg-[#382622] border-2 border-gray-200 dark:border-[#4a3b36] rounded-lg focus:border-[#f05324] focus:ring-4 focus:ring-[#f05324]/20 outline-none transition-all placeholder-transparent"
                  maxLength={1}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="w-full bg-[#f05324] hover:bg-[#d94317] text-white font-bold text-lg py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#f05324]/20 hover:shadow-[#f05324]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xác nhận..." : "Xác nhận"}
              </button>

              <div className="text-center">
                <span className="text-[#9b5d4b] dark:text-gray-500">Chưa nhận được mã? </span>
                <button
                  className="font-bold text-[#1c110d] dark:text-white hover:text-[#f05324] dark:hover:text-[#f05324] transition-colors hover:underline"
                  type="button"
                  onClick={handleResend}
                  disabled={timeLeft > 0}
                >
                  Gửi lại mã
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </>
  )
}
