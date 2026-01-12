"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Head from "next/head"
import { PawPrint } from "lucide-react"
import authService from "@/services/authService"
import petService from "@/services/petService"
import AddPetModal from "@/components/AddPetModal"

interface Pet {
  id: number
  name: string
  species: string
  breed: string
  profilePhoto?: string
  age?: number
}

export default function SelectPetPage() {
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    setUser(currentUser)
    loadPets()
  }, [])

  const loadPets = async () => {
    try {
      setIsLoading(true)
      const response = await petService.getMyPets()
      setPets(response.data || [])
    } catch (error) {
      console.error("Failed to load pets:", error)
      setPets([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPet = (petId: number) => {
    // Store selected pet ID in localStorage
    localStorage.setItem("selected-pet-id", petId.toString())
    // Store full pet object for easy access (e.g. in comments)
    const selectedPet = pets.find(p => p.id === petId);
    if (selectedPet) {
        localStorage.setItem("currentPet", JSON.stringify(selectedPet));
    }
    router.push("/")
  }

  const handleAddNewPet = () => {
    setShowAddModal(true)
  }

  const handleModalSuccess = () => {
    loadPets() // Refresh pet list
  }

  const handleLogout = () => {
    authService.logout()
    router.push("/sign-in")
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </Head>

      <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#221410] font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Decorative Background Pattern */}
        <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(#f05324 1px, transparent 1px), radial-gradient(#FFEB99 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}></div>
        </div>
       
        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 w-full max-w-6xl mx-auto">
          {/* Header Actions - Logout */}
          <div className="absolute top-6 right-6 flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-[#1b110d] dark:text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Đang đăng nhập</p>
             </div>
             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 bg-white dark:bg-[#232329] hover:bg-gray-50 dark:hover:bg-gray-700 text-[#f05324] px-4 py-2 rounded-xl shadow-sm transition-all text-sm font-bold border border-[#f05324]/20"
             >
               <span className="material-symbols-outlined text-[20px]">logout</span>
               <span>Đăng xuất</span>
             </button>
          </div>

          {/* Page Heading */}
          <div className="text-center mb-12 animate-fade-in-up mt-12 sm:mt-0">
            <span className="text-[#d94317] dark:text-[#f05324] font-bold tracking-wider uppercase text-xs mb-2 block">
              Chọn hồ sơ
            </span>
            <h1 className="text-[#1c110d] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-4">
              Hôm nay chơi với ai?
            </h1>
            <p className="text-[#9b5d4b] dark:text-gray-400 text-lg">
              Chọn một hồ sơ để tiếp tục cuộc phiêu lưu của bạn.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f05324] border-t-transparent"></div>
            </div>
          )}

          {/* Pet Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {/* Existing Pets */}
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => handleSelectPet(pet.id)}
                  className="group relative bg-white dark:bg-[#2A1D1A] rounded-2xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center cursor-pointer border border-transparent hover:border-[#f05324]/20 dark:border-gray-700"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#f05324] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div 
                      className="relative size-32 bg-center bg-no-repeat bg-cover rounded-full border-4 border-white dark:border-gray-600 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      style={{backgroundImage: `url("${pet.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pet.name)}")`}}
                    ></div>
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md">
                      <span className="material-symbols-outlined text-[#f05324] text-[20px] fill-1">verified</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-between w-full">
                    <div className="mb-6">
                      <h3 className="text-[#1c110d] dark:text-white text-2xl font-bold mb-1">{pet.name}</h3>
                      <p className="text-[#9b5d4b] dark:text-gray-400 font-medium">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                    <button className="w-full bg-[#f05324] hover:bg-[#d94317] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg shadow-[#f05324]/20">
                      <span>Chọn hồ sơ</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Pet Card */}
              <div
                onClick={handleAddNewPet}
                className="group relative bg-[#fffbeb] dark:bg-[#3a3528] rounded-2xl p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-[#f05324]/30 dark:border-[#f05324]/50 hover:border-[#f05324] hover:bg-[#fff9d6] dark:hover:bg-[#463f2d]"
              >
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-full p-6 shadow-sm group-hover:rotate-90 transition-transform duration-500 ease-in-out">
                  <span className="material-symbols-outlined text-[#f05324] dark:text-[#f05324] text-[48px]">add</span>
                </div>
                <h3 className="text-[#1c110d] dark:text-white text-xl font-bold mb-2">Thêm thú cưng mới</h3>
                <p className="text-[#9b5d4b] dark:text-gray-400 text-sm mb-6 max-w-[200px]">
                  Tạo hồ sơ mới cho một người bạn lông xù khác.
                </p>
                <button className="bg-transparent text-[#f05324] dark:text-[#f05324] font-bold py-2 px-4 rounded-lg flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Bắt đầu</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 pt-8">
            <p className="text-[#9b5d4b] dark:text-gray-500 text-sm font-medium">© 2024 Pet-Connect Inc.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-[#9b5d4b] dark:text-gray-400 hover:text-[#f05324] transition-colors text-sm font-medium">
                Trung tâm trợ giúp
              </Link>
              <Link href="#" className="text-[#9b5d4b] dark:text-gray-400 hover:text-[#f05324] transition-colors text-sm font-medium">
                Chính sách bảo mật
              </Link>
              <Link href="#" className="text-[#9b5d4b] dark:text-gray-400 hover:text-[#f05324] transition-colors text-sm font-medium">
                Điều khoản
              </Link>
            </div>
          </div>
        </footer>
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
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>

      {/* Add Pet Modal */}
      <AddPetModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}
