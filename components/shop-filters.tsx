"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ShopFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentStatus = searchParams.get("status") || ""
  const currentPetType = searchParams.get("petType") || ""
  const currentLocation = searchParams.get("location") || ""
  const currentSort = searchParams.get("sort") || ""

  // Local state for filters
  const [status, setStatus] = useState(currentStatus)
  const [petType, setPetType] = useState(currentPetType)
  const [location, setLocation] = useState(currentLocation)
  const [sort, setSort] = useState(currentSort)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }

    if (petType) {
      params.set("petType", petType)
    } else {
      params.delete("petType")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    if (sort) {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }

    router.push(`/shop?${params.toString()}`)
  }, [status, petType, location, sort, router, searchParams])

  // Reset all filters
  const resetFilters = () => {
    setStatus("")
    setPetType("")
    setLocation("")
    setSort("")
    router.push("/shop")
  }

  // Check if any filters are active
  const hasActiveFilters = status || petType || location || sort

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Bộ lọc đang dùng</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
            <X className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Trạng thái: {status}
              <Button variant="ghost" size="icon" onClick={() => setStatus("")} className="h-4 w-4 p-0 ml-1">
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc trạng thái</span>
              </Button>
            </Badge>
          )}

          {petType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Loại: {petType}
              <Button variant="ghost" size="icon" onClick={() => setPetType("")} className="h-4 w-4 p-0 ml-1">
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc loại thú cưng</span>
              </Button>
            </Badge>
          )}

          {location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Địa điểm: {location}
              <Button variant="ghost" size="icon" onClick={() => setLocation("")} className="h-4 w-4 p-0 ml-1">
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc địa điểm</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["status", "pet-type", "location", "sort"]}>
        <AccordionItem value="status">
          <AccordionTrigger>Trạng thái</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-lost"
                  checked={status === "lost"}
                  onCheckedChange={() => setStatus(status === "lost" ? "" : "lost")}
                />
                <Label htmlFor="status-lost">Thất lạc</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-found"
                  checked={status === "found"}
                  onCheckedChange={() => setStatus(status === "found" ? "" : "found")}
                />
                <Label htmlFor="status-found">Tìm thấy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-adoption"
                  checked={status === "for-adoption"}
                  onCheckedChange={() => setStatus(status === "for-adoption" ? "" : "for-adoption")}
                />
                <Label htmlFor="status-adoption">Cần nhà</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-rescue"
                  checked={status === "rescue"}
                  onCheckedChange={() => setStatus(status === "rescue" ? "" : "rescue")}
                />
                <Label htmlFor="status-rescue">Cứu hộ</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pet-type">
          <AccordionTrigger>Loại thú cưng</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pet-dog"
                  checked={petType === "Chó"}
                  onCheckedChange={() => setPetType(petType === "Chó" ? "" : "Chó")}
                />
                <Label htmlFor="pet-dog">Chó</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pet-cat"
                  checked={petType === "Mèo"}
                  onCheckedChange={() => setPetType(petType === "Mèo" ? "" : "Mèo")}
                />
                <Label htmlFor="pet-cat">Mèo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pet-bird"
                  checked={petType === "Chim"}
                  onCheckedChange={() => setPetType(petType === "Chim" ? "" : "Chim")}
                />
                <Label htmlFor="pet-bird">Chim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pet-rabbit"
                  checked={petType === "Thỏ"}
                  onCheckedChange={() => setPetType(petType === "Thỏ" ? "" : "Thỏ")}
                />
                <Label htmlFor="pet-rabbit">Thỏ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pet-other"
                  checked={petType === "Khác"}
                  onCheckedChange={() => setPetType(petType === "Khác" ? "" : "Khác")}
                />
                <Label htmlFor="pet-other">Khác</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger>Địa điểm</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Input
                placeholder="Ví dụ: Q.1, TP.HCM"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Nhập từ khóa tìm kiếm địa điểm</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sắp xếp theo</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-newest"
                  checked={sort === "newest"}
                  onCheckedChange={() => setSort(sort === "newest" ? "" : "newest")}
                />
                <Label htmlFor="sort-newest">Mới nhất</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-oldest"
                  checked={sort === "oldest"}
                  onCheckedChange={() => setSort(sort === "oldest" ? "" : "oldest")}
                />
                <Label htmlFor="sort-oldest">Cũ nhất</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort-views"
                  checked={sort === "views"}
                  onCheckedChange={() => setSort(sort === "views" ? "" : "views")}
                />
                <Label htmlFor="sort-views">Lượt xem nhiều</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
