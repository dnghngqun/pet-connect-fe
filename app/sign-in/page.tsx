"use client"

import type React from "react"
import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Lock, Check, X, Bone, Heart } from "lucide-react"
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
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
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
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      let fieldRef: typeof emailRef | typeof passwordRef | null = null;
      if (firstErrorField === 'email') fieldRef = emailRef;
      else if (firstErrorField === 'password') fieldRef = passwordRef;

      if (fieldRef && fieldRef.current) {

        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

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
                Đăng nhập 🐾
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                Chào mừng bạn quay lại! Hãy đăng nhập để tiếp tục 🐕
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

              
              <motion.div
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu *</Label>
                  <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors">
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

              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                <Label htmlFor="remember" className="text-sm font-normal text-gray-600">
                  Ghi nhớ đăng nhập
                </Label>
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
                      Đang đăng nhập...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5" />
                      Đăng nhập
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
                <span className="text-gray-600">Chưa có tài khoản?</span>{" "}
                <Link href="/sign-up" className="text-orange-500 hover:text-orange-600 hover:underline font-semibold transition-colors">
                  Đăng ký ngay 🐈
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
                    <svg className="h-5 w-5 mr-2"  viewBox="-3 0 262 262" xmlns="http:
                    Google
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button variant="outline" type="button" className="w-full rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                    <svg className="h-5 w-5 mr-2" viewBox="126.445 2.281 589 589" xmlns="http:
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
