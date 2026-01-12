"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import Head from "next/head"
import { PawPrint } from "lucide-react"
import authService from "@/services/authService"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      
      toast({
        title: "Thành công",
        description: "Mã xác thực đã được gửi đến email của bạn",
        variant: "default",
      })
      
      // Redirect to verify OTP page
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>

      <div className="flex-1 flex items-center justify-center w-full p-4 lg:p-8 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#faf8f5] dark:bg-[#221410]">
        <div className="bg-white dark:bg-[#2A1D1A] w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side: Illustration */}
          <div className="w-full md:w-1/2 bg-[#FFF0EB] dark:bg-[#382622] relative flex items-center justify-center p-12">
            <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#f05324] blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#FFEB99] blur-3xl"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-64 h-64 bg-center bg-contain bg-no-repeat mb-6 relative rounded-2xl" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAa04SwPPVbEFi0p43PasKPt9UOzPLj8X1rvBuxxM9QIGM-fCQmi5PNB7NjtuVGNeHshSUveeOyrJc4xc-mHKXsHBwEwOQe_HvSMGXJSsGGiw2w7matcYGwY91M4z6IoA_BH3tFRtnID5eqJiMdA8QVGavwlgTfnVIsCIxsRyq6J31ZycvnBBWBvTMvfoVQewVRBHjCCeYpjUikA3kFbeJH3uyusSQSmglZ6ZhkihRVWvq6CBPTBseiA4hruDmAjJwAY4jfrz843eg")'}}>
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#2A1D1A] p-3 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-4xl text-orange-400">key_off</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#1c110d] dark:text-white mb-2">Oops!</h3>
              <p className="text-[#9b5d4b] dark:text-gray-400 max-w-xs">Đôi khi ngay cả những chú chó ngoan nhất cũng quên nơi chúng chôn xương (hoặc mật khẩu).</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#2A1D1A]">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#1c110d] dark:text-white mb-3">Quên mật khẩu?</h1>
                <p className="text-[#9b5d4b] dark:text-gray-400 text-base leading-relaxed">
                  Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1c110d] dark:text-gray-200 ml-1" htmlFor="email">Email</label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-[#faf8f5] dark:bg-[#382622] border border-[#E5E5E5] dark:border-[#4a3b36] text-[#1c110d] dark:text-white focus:border-[#f05324] focus:ring-2 focus:ring-[#f05324]/20 outline-none transition-all placeholder:text-gray-400"
                      id="email"
                      name="email"
                      placeholder="bạn@example.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-3.5 text-gray-400 text-[20px]">mail</span>
                  </div>
                </div>

                <button
                  className="w-full bg-[#f05324] hover:bg-[#d94317] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#f05324]/20 hover:shadow-[#f05324]/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b5d4b] hover:text-[#1c110d] dark:text-gray-400 dark:hover:text-white transition-colors" href="/sign-in">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Quay lại Đăng nhập
                </Link>
              </div>
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
