"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Lock, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast";
import authService from "@/services/authService";
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



export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Refs for input fields
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateEmail = (value: string): string => {
    if (!value || !value.trim()) {
      return "Vui lòng nhập email";
    }
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
    if (value.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
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
      case "email":
        error = validateEmail(email);
        break;
      case "password":
        error = validatePassword(password);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {
      email: validateEmail(email),
      password: validatePassword(password)
    };

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });

    // Focus on first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];

      // Direct access to refs
      let fieldRef: typeof emailRef | typeof passwordRef | null = null;
      if (firstErrorField === 'email') fieldRef = emailRef;
      else if (firstErrorField === 'password') fieldRef = passwordRef;

      if (fieldRef && fieldRef.current) {
        // Scroll to the field smoothly
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        // Focus after a short delay to ensure scroll completes
        const refToFocus = fieldRef;
        setTimeout(() => {
          refToFocus.current?.focus();
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
      await authService.login(email, password);
      setIsLoading(false);
      toast({
        title: "Đăng nhập thành công",
        description: "Bạn đã đăng nhập thành công.",
        variant: "default",
      });
      window.location.href = "/";
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={animationVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/40 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
          <motion.div
            className="flex justify-center mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            <PawPrint className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <CardTitle className="text-2xl font-bold">Đăng nhập tài khoản</CardTitle>
            <CardDescription className="mt-2">Nhập email và mật khẩu để truy cập tài khoản của bạn</CardDescription>
          </motion.div>
        </CardHeader>
        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CardContent className="space-y-4">
            {/* Email Field */}
            <motion.div
              className="space-y-2"
            >
              <Label htmlFor="email">Email *</Label>
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
                  className={`transition-all duration-200 ${
                    touched.email && errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : touched.email && !errors.email && email
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
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

            {/* Password Field */}
            <motion.div
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
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
                  }}
                  onBlur={() => handleBlur("password")}
                  className={`transition-all duration-200 ${
                    touched.password && errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : touched.password && !errors.password && password
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
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

            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <input type="checkbox" id="remember" className="rounded border-gray-300" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Ghi nhớ đăng nhập
              </Label>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <Button className="w-full" type="submit" disabled={isLoading}>
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
                    Đang đăng nhập...
                  </motion.div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </motion.div>
            <motion.div
              className="mt-4 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              Chưa có tài khoản?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-semibold transition-colors">
                Đăng ký
              </Link>
            </motion.div>
            <div className="relative mt-6 w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
              </div>
            </div>
            <motion.div
              className="mt-6 grid grid-cols-2 gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Button variant="outline" type="button" className="w-full">
                  <svg className="h-5 w-5 mr-1"  viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
                  Google
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Button variant="outline" type="button" className="w-full">
                  <svg className="h-5 w-5 mr-1" viewBox="126.445 2.281 589 589" xmlns="http://www.w3.org/2000/svg"><circle cx="420.945" cy="296.781" r="294.5" fill="#3c5a9a"/><path d="M516.704 92.677h-65.239c-38.715 0-81.777 16.283-81.777 72.402.189 19.554 0 38.281 0 59.357H324.9v71.271h46.174v205.177h84.847V294.353h56.002l5.067-70.117h-62.531s.14-31.191 0-40.249c0-22.177 23.076-20.907 24.464-20.907 10.981 0 32.332.032 37.813 0V92.677h-.032z" fill="#ffffff"/></svg>
                  Facebook
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-6 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Lock className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Thông tin của bạn được mã hóa bảo mật</span>
            </motion.div>
          </CardFooter>
        </motion.form>
      </Card>
    </motion.div>
    </div>
  )
}
