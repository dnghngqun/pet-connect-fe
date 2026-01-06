"use client"

import type React from "react"

import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Lock, Check, X, Bone, Heart } from "lucide-react"
import authService from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const animationVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const errorVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 }
};


export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Refs for input fields
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateName = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập họ tên";
    }
    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập email";
    }
    // Strict email regex
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(value)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập mật khẩu";
    }
    // Password must have: min 8 chars, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(value)) {
      return "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)";
    }
    return "";
  };

  const validateConfirmPassword = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập lại mật khẩu";
    }
    if (value !== password) {
      return "Mật khẩu nhập lại không khớp";
    }
    return "";
  };

  const validatePhoneNumber = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập số điện thoại";
    }

    // Check if it's Vietnamese phone number (10 digits, starts with 03, 05, 07, 08, 09)
    const vnPhoneRegex = /^0[35789][0-9]{8}$/;

    // Check if it's international phone number (starts with +, 7-15 digits after +)
    const intlPhoneRegex = /^\+[0-9]{7,15}$/;

    if (!vnPhoneRegex.test(value) && !intlPhoneRegex.test(value)) {
      return "Số điện thoại không hợp lệ.";
    }

    return "";
  };

  const validateTerms = (value: boolean): string => {
    if (!value) {
      return "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật";
    }
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field: string) => {
    let error = "";
    switch (field) {
      case "name":
        error = validateName(name);
        break;
      case "email":
        error = validateEmail(email);
        break;
      case "password":
        error = validatePassword(password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(confirmPassword);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(phoneNumber);
        break;
      case "terms":
        error = validateTerms(termsAccepted);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {
      name: validateName(name),
      email: validateEmail(email),
      phoneNumber: validatePhoneNumber(phoneNumber),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      terms: validateTerms(termsAccepted)
    };

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phoneNumber: true,
      terms: true
    });

    // Focus on first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const refMap = {
        name: nameRef,
        email: emailRef,
        phoneNumber: phoneRef,
        password: passwordRef,
        confirmPassword: confirmPasswordRef,
        terms: termsRef
      };

      const fieldRef = refMap[firstErrorField as keyof typeof refMap];
      if (fieldRef?.current) {
        // Scroll to the field smoothly
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        // Focus after a short delay to ensure scroll completes
        setTimeout(() => {
          fieldRef.current?.focus();
        }, 300);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
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
      window.location.href = "/";
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
        variants={animationVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="backdrop-blur-xl bg-white/80 border-white/60 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-2">
            <motion.div
              className="flex justify-center mb-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <div className="p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg">
                <PawPrint className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Tạo tài khoản 🐾
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                Tham gia cộng đồng yêu thú cưng ngay hôm nay 🐕🐈
              </CardDescription>
            </motion.div>
          </CardHeader>
          <motion.form
            onSubmit={handleSubmit}
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardContent className="space-y-4 px-6">
              {/* Name Field */}
              <motion.div
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-gray-700 font-medium">Họ và Tên *</Label>
                <div className="relative">
                  <Input
                    ref={nameRef}
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) validateField("name");
                    }}
                    onBlur={() => handleBlur("name")}
                    className={`rounded-xl border-gray-200 bg-white/70 focus:bg-white transition-all duration-200 ${
                      touched.name && errors.name 
                        ? "border-red-400 focus-visible:ring-red-400" 
                        : touched.name && !errors.name && name
                        ? "border-green-400 focus-visible:ring-green-400" 
                        : "focus-visible:ring-orange-400"
                    }`}
                  />
                  {touched.name && name && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-[34%]"
                    >
                      {errors.name ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {touched.name && errors.name && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Field */}
              <motion.div
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                <div className="relative">
                  <Input
                    ref={emailRef}
                    id="email"
                    type="text"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField("email");
                    }}
                    onBlur={() => handleBlur("email")}
                    className={`rounded-xl border-gray-200 bg-white/70 focus:bg-white transition-all duration-200 ${
                      touched.email && errors.email 
                        ? "border-red-400 focus-visible:ring-red-400" 
                        : touched.email && !errors.email && email
                        ? "border-green-400 focus-visible:ring-green-400" 
                        : "focus-visible:ring-orange-400"
                    }`}
                  />
                  {touched.email && email && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-[34%]"
                    >
                      {errors.email ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {touched.email && errors.email && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Phone Number Field */}
              <motion.div
                className="space-y-2"
              >
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Số điện thoại *</Label>
                <div className="relative">
                  <Input
                    ref={phoneRef}
                    id="phoneNumber"
                    type="tel"
                    placeholder="0912345678"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (touched.phoneNumber) validateField("phoneNumber");
                    }}
                    onBlur={() => handleBlur("phoneNumber")}
                    className={`rounded-xl border-gray-200 bg-white/70 focus:bg-white transition-all duration-200 ${
                      touched.phoneNumber && errors.phoneNumber 
                        ? "border-red-400 focus-visible:ring-red-400" 
                        : touched.phoneNumber && !errors.phoneNumber && phoneNumber
                        ? "border-green-400 focus-visible:ring-green-400" 
                        : "focus-visible:ring-orange-400"
                    }`}
                  />
                  {touched.phoneNumber && phoneNumber && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-[34%]"
                    >
                      {errors.phoneNumber ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {touched.phoneNumber && errors.phoneNumber && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.phoneNumber}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu *</Label>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateField("password");
                      if (touched.confirmPassword && confirmPassword) validateField("confirmPassword");
                    }}
                    onBlur={() => handleBlur("password")}
                    className={`rounded-xl border-gray-200 bg-white/70 focus:bg-white transition-all duration-200 ${
                      touched.password && errors.password 
                        ? "border-red-400 focus-visible:ring-red-400" 
                        : touched.password && !errors.password && password
                        ? "border-green-400 focus-visible:ring-green-400" 
                        : "focus-visible:ring-orange-400"
                    }`}
                  />
                  {touched.password && password && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-[34%]"
                    >
                      {errors.password ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {touched.password && errors.password && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Nhập lại mật khẩu *</Label>
                <div className="relative">
                  <Input
                    ref={confirmPasswordRef}
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) validateField("confirmPassword");
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`rounded-xl border-gray-200 bg-white/70 focus:bg-white transition-all duration-200 ${
                      touched.confirmPassword && errors.confirmPassword 
                        ? "border-red-400 focus-visible:ring-red-400" 
                        : touched.confirmPassword && !errors.confirmPassword && confirmPassword
                        ? "border-green-400 focus-visible:ring-green-400" 
                        : "focus-visible:ring-orange-400"
                    }`}
                  />
                  {touched.confirmPassword && confirmPassword && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-[34%]"
                    >
                      {errors.confirmPassword ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {touched.confirmPassword && errors.confirmPassword && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    ref={termsRef}
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setTermsAccepted(newValue);

                      // Clear error immediately when checkbox is checked
                      if (newValue) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.terms;
                          return newErrors;
                        });
                      } else if (touched.terms) {
                        // Re-validate if unchecked and already touched
                        setErrors(prev => ({
                          ...prev,
                          terms: validateTerms(false)
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("terms")}
                    className={`rounded border-gray-300 text-orange-500 focus:ring-orange-400 transition-all duration-200 ${
                      touched.terms && errors.terms ? "border-red-400" : ""
                    }`}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                    Tôi đồng ý với{" "}
                    <Link href="/terms" className="text-orange-500 hover:text-orange-600 hover:underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link href="/privacy" className="text-orange-500 hover:text-orange-600 hover:underline">
                      Chính sách bảo mật
                    </Link>
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {touched.terms && errors.terms && (
                    <motion.p
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {errors.terms}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col px-6 pb-6">
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-200/50 text-white font-semibold py-5" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Đang tạo tài khoản...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5" />
                      Tạo tài khoản
                    </span>
                  )}
                </Button>
              </motion.div>
              <motion.div
                className="mt-4 text-center text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <span className="text-gray-600">Đã có tài khoản?</span>{" "}
                <Link href="/sign-in" className="text-orange-500 hover:text-orange-600 hover:underline font-semibold transition-colors">
                  Đăng nhập ngay 🐕
                </Link>
              </motion.div>
              <div className="relative mt-6 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>
              <motion.div
                className="mt-6 grid grid-cols-2 gap-4 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button variant="outline" type="button" className="w-full rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                    <svg className="h-5 w-5 mr-2"  viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
                    Google
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button variant="outline" type="button" className="w-full rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                    <svg className="h-5 w-5 mr-2" viewBox="126.445 2.281 589 589" xmlns="http://www.w3.org/2000/svg"><circle cx="420.945" cy="296.781" r="294.5" fill="#3c5a9a"/><path d="M516.704 92.677h-65.239c-38.715 0-81.777 16.283-81.777 72.402.189 19.554 0 38.281 0 59.357H324.9v71.271h46.174v205.177h84.847V294.353h56.002l5.067-70.117h-62.531s.14-31.191 0-40.249c0-22.177 23.076-20.907 24.464-20.907 10.981 0 32.332.032 37.813 0V92.677h-.032z" fill="#ffffff"/></svg>
                    Facebook
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                className="mt-6 flex items-center justify-center gap-2 bg-orange-50/80 rounded-xl py-2 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Lock className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-orange-600">Thông tin của bạn được mã hóa bảo mật 🔐</span>
              </motion.div>
            </CardFooter>
          </motion.form>
        </Card>
      </motion.div>
    </div>
  )
}
