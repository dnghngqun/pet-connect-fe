"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef } from "react"
import { toast } from "@/components/ui/use-toast";
import authService from "@/services/authService";
import Head from "next/head";
import { PawPrint } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Refs for input fields
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      setIsLoading(false);
      toast({
        title: "Đăng nhập thành công",
        description: "Bạn đã đăng nhập thành công.",
        variant: "default",
      });

      const user = authService.getCurrentUser();
      
      if (user && user.hasPets === false) {
          window.location.href = "/onboarding";
      } else {
          window.location.href = "/select-pet";
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Đăng nhập thất bại",
        description: error.response?.data?.message || error.message || "Đã có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>
      
      <div className="relative flex min-h-screen w-full overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Left Panel: Brand Storytelling & Illustration */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-[#FFF0EB] dark:bg-[#382622] p-12 transition-colors duration-300">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#f05324] blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#82B0A6] blur-3xl"></div>
          </div>
          
          {/* Logo area */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f05324] text-white">
               <PawPrint className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#101914] dark:text-white">PetConnect</h2>
          </div>
          
          {/* Main Illustration */}
          <div className="relative z-10 my-auto flex w-full flex-col items-center justify-center">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] duration-500">
              <div className="aspect-[4/3] w-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBpi_H2VrBuMbHj8MHmEAzAzTJXAxWzM2qeNCG6rZbUHzrLewg5iynmtRYgF2EFX98nBQIwRE32DlT-DfMx3Cvy3ABQEFhYFKD-yVISly8voxn4qlvGcEsXz1lbwyLQyhY8rUYdZ4fdFozff3pryf9oTrCL3U96BrkL5lUXzG_gZPbXE3Ru5QPY5DyMHWaIMyKEfzBkT3D1YrNSZyPV37J2i5Z3C1myXktsolEvQML1AFZx8i9X9N9N8clgC1rKK-EcnmSEymqGX00")'}}></div>
            </div>
            <div className="mt-8 text-center max-w-md">
              <h3 className="text-3xl font-bold leading-tight text-[#101914] dark:text-white mb-3">Kết nối yêu thương, chia sẻ khoảnh khắc.</h3>
              <p className="text-[#9b5d4b] dark:text-gray-400 text-lg">Gia nhập cộng đồng hơn 1 triệu người yêu thú cưng ngay hôm nay.</p>
            </div>
          </div>
          
          {/* Footer Meta */}
          <div className="relative z-10 flex justify-between text-sm text-[#9b5d4b] dark:text-gray-500 font-medium">
            <span>© 2024 Pet-Connect Inc.</span>
            <div className="flex gap-4">
              <a className="hover:text-[#98e6bf] transition-colors" href="#">Điều khoản</a>
              <a className="hover:text-[#98e6bf] transition-colors" href="#">Quyền riêng tư</a>
            </div>
          </div>
        </div>
        
        {/* Right Panel: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 relative bg-[#fbfaf9] dark:bg-[#21242c]">
          {/* Mobile Logo */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <div className="text-[#f05324]">
              <span className="material-symbols-outlined">pets</span>
            </div>
            <span className="font-bold text-lg text-[#101914] dark:text-white">Pet-Connect</span>
          </div>
          
          <div className="w-full max-w-[440px] bg-white dark:bg-[#2c313a] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 md:p-10 transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-[#101914] dark:text-white tracking-tight mb-2">Chào mừng trở lại!</h1>
              <p className="text-[#9b5d4b] dark:text-gray-400">Vui lòng nhập thông tin để đăng nhập.</p>
            </div>
            
            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#101914] dark:text-gray-200">Email hoặc Số điện thoại</span>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#9b5d4b] dark:text-gray-500 material-symbols-outlined" style={{fontSize: '20px'}}>mail</span>
                  <input 
                    ref={emailRef}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#fbfaf9] dark:bg-[#21242c] py-3.5 pl-11 pr-4 text-sm text-[#101914] dark:text-white placeholder:text-gray-400 focus:border-[#f05324] focus:ring-2 focus:ring-[#f05324]/20 outline-none transition-all" 
                    placeholder="example@email.com" 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>
              
              {/* Password Input */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#101914] dark:text-gray-200">Mật khẩu</span>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#9b5d4b] dark:text-gray-500 material-symbols-outlined" style={{fontSize: '20px'}}>lock</span>
                  <input 
                    ref={passwordRef}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#fbfaf9] dark:bg-[#21242c] py-3.5 pl-11 pr-12 text-sm text-[#101914] dark:text-white placeholder:text-gray-400 focus:border-[#f05324] focus:ring-2 focus:ring-[#f05324]/20 outline-none transition-all" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-4 text-[#9b5d4b] dark:text-gray-500 hover:text-[#101914] dark:hover:text-white transition-colors cursor-pointer flex items-center" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </label>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link className="text-sm font-medium text-[#9b5d4b] hover:text-[#f05324] dark:text-gray-400 dark:hover:text-[#f05324] transition-colors" href="/forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>
              
              {/* Submit Button */}
              <button 
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f05324] hover:bg-[#d94317] py-3.5 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                {!isLoading && <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{fontSize: '20px'}}>arrow_forward</span>}
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative my-8 flex items-center py-2">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
              <span className="mx-4 flex-shrink-0 text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Hoặc đăng nhập bằng</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
            </div>
            
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#21242c] py-2.5 text-sm font-semibold text-[#101914] dark:text-white transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#21242c] py-2.5 text-sm font-semibold text-[#101914] dark:text-white transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
            
            {/* Footer Sign Up */}
            <p className="mt-8 text-center text-sm font-medium text-[#101914] dark:text-gray-300">
              Chưa có tài khoản? 
              <Link className="ml-1 font-bold text-[#f05324] hover:underline hover:text-[#d94317] transition-colors" href="/sign-up">
                Đăng ký ngay
              </Link>
            </p>
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
