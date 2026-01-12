"use client"

import type React from "react"

import Link from "next/link"
import { useState, useRef } from "react"
import authService from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import Head from "next/head";
import { PawPrint } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Refs for input fields
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi xác thực",
        description: "Mật khẩu nhập lại không khớp",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Lỗi xác thực",
        description: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(name, phoneNumber, email, password);
      setIsLoading(false);
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công.",
        variant: "default",
      });
      window.location.href = "/select-pet";
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Đăng ký thất bại",
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>

      <div className="flex-1 flex items-center justify-center w-full p-4 lg:p-8 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#faf8f5] dark:bg-[#221410]">
        {/* Main Container Card */}
        <div className="bg-white dark:bg-[#2A1D1A] w-full max-w-6xl rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row min-h-[700px]">
          {/* Left Side: Illustration */}
          <div className="hidden lg:flex lg:w-5/12 relative bg-[#FFF0EB] dark:bg-[#382622] flex-col justify-center items-center p-12 overflow-hidden group">
            {/* Decorative Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 dark:opacity-10 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#f05324] blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#82B0A6] blur-3xl"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg relative bg-gray-100">
                <img alt="A happy person hugging a golden retriever dog" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8Y2nFniWf3Ab0W3uwSP8Z1dm0ALWWpU7Abb9EqFfLvSQLY1UnnzqhFLqWTZ5BJQuuaF4ByWxlAQ4Jzs-KfxthJlRNGqH2n9RwctnjwlnURDK-0B_WM3PyzHRwlEgiYESJjUBBV18M4Sv_rqmtxSpEkNNP5ZO_8rpB1kHKK-pXsseYl1z0r7J_QHkGA2S4MTXnSy0vjS0DA_YphHvYo8ZgRREynakJ66GcGsyK1xiVYulCJKHNe25IphVbBb3TOoYkZUAAju2Ag-k"/>
              </div>
              <div className="max-w-xs mx-auto mt-6">
                <h3 className="text-2xl font-bold text-[#1c110d] dark:text-white mb-2">Kết nối yêu thương</h3>
                <p className="text-[#9b5d4b] dark:text-gray-400 leading-relaxed">Tham gia cộng đồng hàng nghìn người yêu thú cưng và chia sẻ những khoảnh khắc đáng nhớ.</p>
              </div>
            </div>
          </div>
          
          {/* Right Side: Registration Form */}
          <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="size-8 text-[#f05324]">
                   <PawPrint className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#1c110d] dark:text-white">PetConnect</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1c110d] dark:text-white mb-3">Chào mừng bạn mới!</h1>
              <p className="text-[#9b5d4b] dark:text-gray-400 text-lg">Tạo tài khoản để bắt đầu hành trình cùng thú cưng của bạn.</p>
            </div>
            
            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-medium text-[#1c110d] dark:text-gray-200 mb-1.5 ml-1" htmlFor="fullname">Họ và tên chủ nuôi</label>
                <div className="relative">
                  <input 
                    ref={nameRef}
                    className="w-full px-5 py-3.5 bg-[#faf8f5] dark:bg-[#382622] dark:text-white border border-[#E5E5E5] dark:border-[#4a3b36] rounded-xl focus:ring-2 focus:ring-[#82B0A6]/50 focus:border-[#82B0A6] outline-none transition-all placeholder:text-gray-400 font-medium" 
                    id="fullname" 
                    placeholder="Ví dụ: Nguyễn Văn A" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-[#1c110d] dark:text-gray-200 mb-1.5 ml-1" htmlFor="email">Email</label>
                <div className="relative">
                  <input 
                    ref={emailRef}
                    className="w-full px-5 py-3.5 bg-[#faf8f5] dark:bg-[#382622] dark:text-white border border-[#E5E5E5] dark:border-[#4a3b36] rounded-xl focus:ring-2 focus:ring-[#82B0A6]/50 focus:border-[#82B0A6] outline-none transition-all placeholder:text-gray-400 font-medium" 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Phone Number */}
              <div className="group">
                <label className="block text-sm font-medium text-[#1c110d] dark:text-gray-200 mb-1.5 ml-1" htmlFor="phone">Số điện thoại</label>
                <div className="relative">
                  <input 
                    ref={phoneRef}
                    className="w-full px-5 py-3.5 bg-[#faf8f5] dark:bg-[#382622] dark:text-white border border-[#E5E5E5] dark:border-[#4a3b36] rounded-xl focus:ring-2 focus:ring-[#82B0A6]/50 focus:border-[#82B0A6] outline-none transition-all placeholder:text-gray-400 font-medium" 
                    id="phone" 
                    placeholder="0912345678" 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-[#1c110d] dark:text-gray-200 mb-1.5 ml-1" htmlFor="password">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      ref={passwordRef}
                      className="w-full px-5 py-3.5 bg-[#faf8f5] dark:bg-[#382622] dark:text-white border border-[#E5E5E5] dark:border-[#4a3b36] rounded-xl focus:ring-2 focus:ring-[#82B0A6]/50 focus:border-[#82B0A6] outline-none transition-all placeholder:text-gray-400 font-medium" 
                      id="password" 
                      placeholder="Ít nhất 8 ký tự" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[#1c110d] dark:text-gray-200 mb-1.5 ml-1" htmlFor="confirm_password">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input 
                      ref={confirmPasswordRef}
                      className="w-full px-5 py-3.5 bg-[#faf8f5] dark:bg-[#382622] dark:text-white border border-[#E5E5E5] dark:border-[#4a3b36] rounded-xl focus:ring-2 focus:ring-[#82B0A6]/50 focus:border-[#82B0A6] outline-none transition-all placeholder:text-gray-400 font-medium" 
                      id="confirm_password" 
                      placeholder="Nhập lại mật khẩu" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center h-5">
                  <input 
                    ref={termsRef}
                    className="peer size-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white dark:bg-[#382622] dark:border-[#4a3b36] checked:bg-[#f05324] checked:border-transparent focus:ring-2 focus:ring-[#f05324]/20 transition-all" 
                    id="terms" 
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                    </svg>
                  </span>
                </div>
                <label className="text-sm text-[#9b5d4b] dark:text-gray-400 select-none" htmlFor="terms">
                  Tôi đồng ý với <a className="text-[#1c110d] dark:text-white font-semibold hover:underline" href="#">các điều khoản</a> và <a className="text-[#1c110d] dark:text-white font-semibold hover:underline" href="#">chính sách bảo mật</a> của Pet-Connect.
                </label>
              </div>
              
              {/* Submit Button */}
              <button 
                className="w-full py-4 px-6 bg-[#f05324] hover:bg-[#d94317] text-white font-bold rounded-xl shadow-lg shadow-[#f05324]/20 hover:shadow-[#f05324]/30 transform hover:-translate-y-0.5 transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
                {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
              
              {/* Footer Link */}
              <div className="text-center mt-6 pt-4 border-t border-dashed border-[#E5E5E5] dark:border-[#4a3b36]">
                <p className="text-[#9b5d4b] dark:text-gray-400">
                  Đã có tài khoản? 
                  <Link className="text-[#f05324] hover:underline hover:text-[#d94317] font-bold ml-1 transition-colors" href="/sign-in">Đăng nhập</Link>
                </p>
              </div>
            </form>
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
