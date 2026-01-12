"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PawPrint, Camera, ChevronRight, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
// import petService from "@/services/petService"; // To be implemented/verified

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    species: "DOG", // Default to Dog
    breed: "",
    age: "",
    gender: "MALE",
    bio: "",
    avatar: null as File | null,
    avatarPreview: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // TODO: Implement actual create pet API call here
        // await petService.createPet(formData);
        
        // Mock success for now
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: "Chào mừng thành viên mới! 🎉",
            description: `${formData.name} đã được thêm vào gia đình PetsConnect.`,
        });
        
        // Update local storage to reflect hasPets = true
        const userStr = localStorage.getItem('pet-connect-user');
        if (userStr) {
            const user = JSON.parse(userStr);
            user.hasPets = true;
            localStorage.setItem('pet-connect-user', JSON.stringify(user));
        }

        router.push("/");
    } catch (error) {
        toast({
            title: "Có lỗi xảy ra",
            description: "Không thể thêm thú cưng. Vui lòng thử lại.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-white/50 bg-white/90 backdrop-blur-md overflow-hidden rounded-3xl">
          <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white p-8">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
            >
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <PawPrint className="w-10 h-10 text-white" />
                </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold">Chào mừng bạn! 👋</CardTitle>
            <CardDescription className="text-orange-100 mt-2 text-lg">
              Hãy giới thiệu người bạn nhỏ của bạn để bắt đầu.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-lg">Tên thú cưng</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: Milu, Kiki..." 
                        className="text-lg p-6 rounded-xl border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="species" className="text-lg">Loài</Label>
                        <select 
                            id="species" 
                            name="species" 
                            value={formData.species} 
                            onChange={handleInputChange}
                            className="w-full p-4 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="DOG">Chó 🐕</option>
                            <option value="CAT">Mèo 🐈</option>
                            <option value="OTHER">Khác 🐾</option>
                        </select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="gender" className="text-lg">Giới tính</Label>
                        <select 
                            id="gender" 
                            name="gender" 
                            value={formData.gender} 
                            onChange={handleInputChange}
                            className="w-full p-4 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="MALE">Đực ♂️</option>
                            <option value="FEMALE">Cái ♀️</option>
                        </select>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        onClick={nextStep} 
                        className="w-full py-6 text-lg rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-300/50"
                        disabled={!formData.name}
                    >
                        Tiếp tục <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                   <motion.div
                   key="step2"
                   initial={{ x: 20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: -20, opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="space-y-6"
                 >
                   <div className="flex flex-col items-center justify-center space-y-4">
                       <Label className="text-lg">Ảnh đại diện (Tùy chọn)</Label>
                       <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                           <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-orange-200 flex items-center justify-center bg-orange-50 transition-all group-hover:border-orange-400 ${!formData.avatarPreview ? 'p-8' : ''}`}>
                               {formData.avatarPreview ? (
                                   <img src={formData.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                   <Camera className="w-12 h-12 text-orange-300" />
                               )}
                           </div>
                           <div className="absolute bottom-2 right-2 bg-orange-500 p-2 rounded-full text-white shadow-md">
                               <Camera className="w-4 h-4" />
                           </div>
                       </div>
                       <input 
                           id="avatar-upload" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleFileChange}
                       />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="bio" className="text-lg">Đôi lời về bé</Label>
                     <Input 
                       id="bio" 
                       name="bio" 
                       value={formData.bio} 
                       onChange={handleInputChange} 
                       placeholder="Bé rất ngoan và thích chơi bóng..." 
                       className="p-6 rounded-xl border-orange-200"
                     />
                   </div>

                   <div className="flex gap-4">
                       <Button type="button" variant="outline" onClick={prevStep} className="flex-1 py-6 rounded-xl">
                           Quay lại
                       </Button>
                       <Button 
                           type="submit" 
                           className="flex-1 py-6 text-lg rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-300/50"
                           disabled={isLoading}
                       >
                           {isLoading ? "Đang tạo..." : "Hoàn tất ✨"}
                       </Button>
                   </div>
                 </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> Tài khoản của bạn đã được tạo
              </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
