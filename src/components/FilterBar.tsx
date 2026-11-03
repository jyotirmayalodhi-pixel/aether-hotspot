import { useState, useEffect } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Wifi,
  Building,
  GraduationCap,
  FlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplaintStore } from '@/store'
import type { Category, Status } from '@/domain'

const CATEGORY_OPTIONS: Array<{
  id: Category | 'All'
  label: string
  icon?: typeof Wifi
}> = [
  { id: 'All', label: 'All Categories' },
  { id: 'Wi-Fi', label: 'Wi-Fi', icon: Wifi },
  { id: 'Hostel', label: 'Hostel', icon: Building },
  { id: 'Classroom', label: 'Classroom', icon: GraduationCap },
  { id: 'Laboratory', label: 'Laboratory', icon: FlaskConical },
]

const STATUS_OPTIONS: Array<{
  id: Status | 'All'
  label: string
  color?: string
}> = [
  { id: 'All', label: 'All Statuses' },
  { id: 'Raised', label: 'Raised', color: '#E5237A' },
  { id: 'In Progress', label: 'In Progress', color: '#FFD23F' },
  { id: 'Resolved', label: 'Resolved', color: '#3FD0C9' },
]

export function FilterBar() {
  const searchQuery = useComplaintStore((state) => state.searchQuery)
  const setSearchQuery = useComplaintStore((state) => state.setSearchQuery)
  const categoryFilter = useComplaintStore((state) => state.categoryFilter)
  const setCategoryFilter = useComplaintStore((state) => state.setCategoryFilter)
  const statusFilter = useComplaintStore((state) => state.statusFilter)
  const setStatusFilter = useComplaintStore((state) => state.setStatusFilter)
  const sortBy = useComplaintStore((state) => state.sortBy)
  const setSortBy = useComplaintStore((state) => state.setSortBy)

  // 150ms debounced search input local state
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 150)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'All' ||
    statusFilter !== 'All' ||
    sortBy !== 'priority'

  const handleClearFilters = () => {
    setLocalSearch('')
    setSearchQuery('')
    setCategoryFilter('All')
    setStatusFilter('All')
    setSortBy('priority')
  }

  return (
    <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-4 md:p-5 space-y-4 shadow-xl">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Debounced Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A79FD6]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by ID, problem description, or category (150ms debounced)..."
            className="w-full bg-[#0D0A26] border border-[#E9E4FF]/15 rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#E9E4FF] placeholder:text-[#A79FD6]/50 focus:outline-none focus:border-[#3FD0C9] focus:ring-1 focus:ring-[#3FD0C9] transition-all font-sans"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('')
                setSearchQuery('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A79FD6] hover:text-[#E9E4FF] cursor-pointer"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls & Clear */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#0D0A26] border border-[#E9E4FF]/15 rounded-xl px-2.5 py-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3FD0C9]" />
            <span className="text-[#A79FD6] text-[11px] font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'priority' | 'newest' | 'oldest')
              }
              className="bg-transparent text-[#E9E4FF] font-semibold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="priority" className="bg-[#181342] text-[#E9E4FF]">
                Urgency Priority
              </option>
              <option value="newest" className="bg-[#181342] text-[#E9E4FF]">
                Newest First
              </option>
              <option value="oldest" className="bg-[#181342] text-[#E9E4FF]">
                Oldest First
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              className="bg-[#261F63] hover:bg-[#322982] text-xs text-[#E9E4FF] border border-[#E9E4FF]/20 h-9 px-3 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-[#FF7A18]" />
              <span>Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#E9E4FF]/10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] uppercase font-mono font-bold text-[#A79FD6] mr-1">
            Category:
          </span>
          {CATEGORY_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isSelected = categoryFilter === opt.id

            return (
              <button
                key={opt.id}
                onClick={() => setCategoryFilter(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3FD0C9] text-[#0D0A26] font-bold shadow-md shadow-[#3FD0C9]/20'
                    : 'bg-[#0D0A26]/80 text-[#E9E4FF] border border-[#E9E4FF]/12 hover:border-[#E9E4FF]/30 hover:bg-[#0D0A26]'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3 h-3 ${isSelected ? 'text-[#0D0A26]' : 'text-[#3FD0C9]'}`}
                  />
                )}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] uppercase font-mono font-bold text-[#A79FD6] mr-1">
            Status:
          </span>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = statusFilter === opt.id

            return (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E9E4FF] text-[#0D0A26] font-bold shadow-md'
                    : 'bg-[#0D0A26]/80 text-[#E9E4FF] border border-[#E9E4FF]/12 hover:border-[#E9E4FF]/30 hover:bg-[#0D0A26]'
                }`}
              >
                {opt.color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                )}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
