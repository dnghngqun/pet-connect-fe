"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import Head from "next/head"
import { useSearchParams } from "next/navigation"
import { PawPrint } from "lucide-react"
import authService from "@/services/authService"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get("email") || ""
  const otp = searchParams?.get("otp") || ""
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const getPasswordStrength = () => {
    const checks = [hasMinLength, hasUpperCase, hasNumber, hasSpecialChar]
    const passedChecks = checks.filter(Boolean).length
    
    if (passedChecks === 0) return { label: "", color: "bg-gray-200", count: 0 }
    if (passedChecks <= 2) return { label: "Yếu", color: "bg-red-500", count: 1 }
    if (passedChecks === 3) return { label: "Trung bình", color: "bg-yellow-500", count: 2 }
    return { label: "Mạnh", color: "bg-green-500", count: 3 }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu nhập lại không khớp",
        variant: "destructive",
      })
      return
    }

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu chưa đáp ứng đủ yêu cầu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword(email, otp, password)
      
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được đặt lại thành công",
        variant: "default",
      })
      
      // Redirect to login
      window.location.href = "/sign-in"
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>

      <div className="flex-1 flex items-center justify-center w-full p-4 lg:p-8 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#faf8f5] dark:bg-[#221410]">
        <div className="w-full max-w-[1100px] bg-white dark:bg-[#2A1D1A] rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row min-h-[680px]">
          {/* Left Side: Illustration Panel */}
          <div className="lg:w-1/2 bg-[#FFF0EB] dark:bg-[#382622] relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden group">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#f05324]/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[300px] h-[300px] bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-full max-w-[320px] aspect-square bg-center bg-contain bg-no-repeat mb-10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] rounded-3xl" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAyl3Xfm39ybCpnBboOhhDAAXsnGPbHwFb9NIv_7S9dT3NccNX_2oh2Old7NTbiJbdAHY1TqoMeRWIhVAQCDHOywUGY8e8s6pX8WB4J50wyAUQMomojhgN8Geh3FWvqwu9KFFoqJN7Q44-IqAFZ3XmpgO1TA0NnyKfZMWZPc7fgOc5UXHlWmLgbfcKFN8nz2kGPkTrOP7WgIAlMZSVYBnfKdThSZFylea9YGRyzWTWcTNvuF0lcO2g0lWygC9b0Z1lHtpJ5PKxiOao")'}}></div>
              <h3 className="text-2xl font-extrabold text-[#1c110d] dark:text-white mb-3 tracking-tight">Bảo vệ tài khoản</h3>
              <p className="text-[#9b5d4b] dark:text-gray-400 max-w-xs leading-relaxed font-medium">
                Giữ cho Pet-Connect luôn là không gian an toàn và vui vẻ cho thú cưng của bạn.
              </p>
            </div>
          </div>

          {/* Right Side: Form Panel */}
          <div className="lg:w-1/2 flex flex-col p-6 md:p-12 lg:p-14 w-full relative bg-white dark:bg-[#2A1D1A]">
            {/* Logo Header */}
            <div className="flex items-center gap-3 mb-10 text-[#1c110d] dark:text-white">
              <div className="size-10 bg-[#f05324]/20 dark:bg-[#f05324]/10 rounded-xl flex items-center justify-center text-[#1c110d] dark:text-[#f05324] border border-[#f05324]/30">
                <PawPrint className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">Pet-Connect</h2>
            </div>

            <div className="max-w-[420px] w-full mx-auto flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1c110d] dark:text-white mb-3 tracking-tight">Đặt lại mật khẩu</h1>
                <p className="text-[#9b5d4b] dark:text-gray-400 font-medium">Tạo mật khẩu mới để truy cập lại vào thế giới thú cưng.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 ml-1">Mật khẩu mới</label>
                  <div className="relative group/input">
                    <input
                      className="block w-full h-14 pl-5 pr-12 rounded-xl border-2 border-gray-200 dark:border-[#4a3b36] bg-[#faf8f5] dark:bg-[#382622] text-[#1c110d] dark:text-white focus:border-[#f05324] focus:ring-0 focus:bg-white dark:focus:bg-[#2A1D1A] transition-all font-medium placeholder:text-gray-400 text-lg outline-none"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-0 top-0 h-full px-4 text-[#9b5d4b] hover:text-[#f05324] transition-colors flex items-center justify-center rounded-r-xl"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {password && (
                    <div className="pt-3 px-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-[#9b5d4b] dark:text-gray-400 uppercase tracking-wider">Độ mạnh</span>
                        <span className={`text-sm font-bold ${strength.count === 1 ? 'text-red-500' : strength.count === 2 ? 'text-yellow-500' : strength.count === 3 ? 'text-green-500' : 'text-gray-400'}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="flex gap-1.5 h-2 w-full">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.count >= 1 ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.count >= 2 ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.count >= 3 ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1c110d] dark:text-gray-200 ml-1">Xác nhận mật khẩu mới</label>
                  <div className="relative group/input">
                    <input
                      className="block w-full h-14 pl-5 pr-12 rounded-xl border-2 border-gray-200 dark:border-[#4a3b36] bg-[#faf8f5] dark:bg-[#382622] text-[#1c110d] dark:text-white focus:border-[#f05324] focus:ring-0 focus:bg-white dark:focus:bg-[#2A1D1A] transition-all font-medium placeholder:text-gray-400 text-lg outline-none"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-0 top-0 h-full px-4 text-[#9b5d4b] hover:text-[#f05324] transition-colors flex items-center justify-center rounded-r-xl"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-2 px-1">
                  <div className={`flex items-center gap-2.5 text-sm font-medium transition-colors duration-300 ${hasMinLength ? 'text-[#1c110d] dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {hasMinLength ? (
                      <span className="material-symbols-outlined text-[20px] text-[#f05324] fill-1">check_circle</span>
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"></div>
                    )}
                    <span>Ít nhất 8 ký tự</span>
                  </div>

                  <div className={`flex items-center gap-2.5 text-sm font-medium transition-colors duration-300 ${hasUpperCase ? 'text-[#1c110d] dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {hasUpperCase ? (
                      <span className="material-symbols-outlined text-[20px] text-[#f05324] fill-1">check_circle</span>
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"></div>
                    )}
                    <span>1 chữ cái viết hoa</span>
                  </div>

                  <div className={`flex items-center gap-2.5 text-sm font-medium transition-colors duration-300 ${hasNumber ? 'text-[#1c110d] dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {hasNumber ? (
                      <span className="material-symbols-outlined text-[20px] text-[#f05324] fill-1">check_circle</span>
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"></div>
                    )}
                    <span>1 số</span>
                  </div>

                  <div className={`flex items-center gap-2.5 text-sm font-medium transition-colors duration-300 ${hasSpecialChar ? 'text-[#1c110d] dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {hasSpecialChar ? (
                      <span className="material-symbols-outlined text-[20px] text-[#f05324] fill-1">check_circle</span>
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"></div>
                    )}
                    <span>1 ký tự đặc biệt</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="w-full mt-6 bg-[#f05324] hover:bg-[#d94317] text-white font-bold text-base h-14 rounded-xl shadow-lg shadow-[#f05324]/20 hover:shadow-[#f05324]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
                  {!isLoading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
                </button>

                {/* Back Link */}
                <div className="text-center mt-4">
                  <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-[#9b5d4b] hover:text-[#1c110d] dark:text-gray-500 dark:hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-[#faf8f5] dark:hover:bg-white/5" href="/sign-in">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
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
