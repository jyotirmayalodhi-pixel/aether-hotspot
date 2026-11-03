import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  advanceComplaintStatus,
  generateNextId,
  getNextAllowedStatus,
  isValidComplaintRecord,
} from '@/domain'
import type {
  Category,
  Complaint,
  FormulaMode,
  Status,
  TieBreakOrder,
} from '@/domain'

export const STORAGE_KEY = 'aether_hotspot.v3'
export const STORAGE_VERSION = 3

/**
 * Returns fresh seed complaints with timestamps relative to now.
 */
export function getSeedComplaints(now = Date.now()): Complaint[] {
  return [
    {
      id: 'C01',
      category: 'Wi-Fi',
      description:
        'Wi-Fi keeps dropping every few minutes in the library reading hall and main academic block.',
      status: 'Raised',
      submittedAt: now - 48 * 3600000,
      updatedAt: now - 48 * 3600000,
      history: [{ from: null, to: 'Raised', changedAt: now - 48 * 3600000 }],
    },
    {
      id: 'C02',
      category: 'Hostel',
      description:
        'Hot water geyser and drinking water cooler not working on the second floor of Hostel Block B.',
      status: 'In Progress',
      submittedAt: now - 8 * 3600000,
      updatedAt: now - 8 * 3600000,
      history: [
        { from: null, to: 'Raised', changedAt: now - 8 * 3600000 },
        { from: 'Raised', to: 'In Progress', changedAt: now - 8 * 3600000 },
      ],
    },
    {
      id: 'C03',
      category: 'Classroom',
      description:
        'Ceiling projector HDMI matrix in Room 204 will not turn on, disrupting scheduled lectures.',
      status: 'Raised',
      submittedAt: now - 72 * 3600000,
      updatedAt: now - 72 * 3600000,
      history: [{ from: null, to: 'Raised', changedAt: now - 72 * 3600000 }],
    },
    {
      id: 'C04',
      category: 'Laboratory',
      description:
        'Oscilloscope workbench ground fault and microscope lamp failure at Station 3 in Lab 2.',
      status: 'Resolved',
      submittedAt: now - 24 * 3600000,
      updatedAt: now,
      history: [
        { from: null, to: 'Raised', changedAt: now - 24 * 3600000 },
        { from: 'Raised', to: 'In Progress', changedAt: now - 12 * 3600000 },
        { from: 'In Progress', to: 'Resolved', changedAt: now },
      ],
    },
  ]
}

export interface ComplaintStoreState {
  // Persisted state
  complaints: Complaint[]

  // Transient state (NEVER saved to localStorage)
  timeOffsetHours: number
  searchQuery: string
  categoryFilter: Category | 'All'
  statusFilter: Status | 'All'
  sortBy: 'priority' | 'newest' | 'oldest'
  formulaMode: FormulaMode
  tieBreakOrder: TieBreakOrder
  selectedComplaintId: string | null
  storageRecoveredNotice: boolean
  currentTime: number

  // Actions
  addComplaint: (input: {
    category: Category
    description: string
    initialHoursAgo?: number
  }) => Complaint
  advanceStatus: (id: string) => void
  resetToSeedData: () => void
  injectTieBreakDemo: () => void
  importComplaints: (rawItems: unknown[]) => {
    added: number
    rejected: number
    renamed: number
  }
  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: Category | 'All') => void
  setStatusFilter: (status: Status | 'All') => void
  setSortBy: (sortBy: 'priority' | 'newest' | 'oldest') => void
  setTimeOffsetHours: (hours: number) => void
  setFormulaMode: (mode: FormulaMode) => void
  setTieBreakOrder: (order: TieBreakOrder) => void
  setSelectedComplaintId: (id: string | null) => void
  dismissStorageRecoveredNotice: () => void
  updateCurrentTime: () => void
}

/**
 * Storage engine adapter with defensive corruption handling.
 * If raw JSON in localStorage is broken, it safely returns a recovery marker.
 */
const safeStorageEngine = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }
      const raw = window.localStorage.getItem(name)
      if (raw === null) return null

      try {
        JSON.parse(raw)
        return raw
      } catch {
        // Broken JSON detected in localStorage!
        // Return a valid JSON string that will be parsed by createJSONStorage
        return JSON.stringify({
          state: {
            complaints: [],
            _corrupt: true,
          },
          version: STORAGE_VERSION,
        })
      }
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value)
      }
    } catch (e) {
      console.warn('Storage setItem failed:', e)
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name)
      }
    } catch (e) {
      console.warn('Storage removeItem failed:', e)
    }
  },
}

export const useComplaintStore = create<ComplaintStoreState>()(
  persist(
    (set, get) => ({
      // Default state
      complaints: getSeedComplaints(),
      timeOffsetHours: 0,
      searchQuery: '',
      categoryFilter: 'All',
      statusFilter: 'All',
      sortBy: 'priority',
      formulaMode: 'baseline',
      tieBreakOrder: 'age-first',
      selectedComplaintId: null,
      storageRecoveredNotice: false,
      currentTime: Date.now(),

      addComplaint: ({ category, description, initialHoursAgo = 0 }) => {
        const currentComplaints = get().complaints
        const nextId = generateNextId(currentComplaints)
        const now = Date.now()
        const clampedHoursAgo = Math.max(0, initialHoursAgo)
        const submittedAt = now - clampedHoursAgo * 3600000

        const newComplaint: Complaint = {
          id: nextId,
          category,
          description: description.trim(),
          status: 'Raised',
          submittedAt,
          updatedAt: now,
          history: [{ from: null, to: 'Raised', changedAt: submittedAt }],
        }

        set({
          complaints: [newComplaint, ...currentComplaints],
        })

        return newComplaint
      },

      advanceStatus: (id: string) => {
        const now = Date.now()
        const currentComplaints = get().complaints
        const targetIndex = currentComplaints.findIndex((c) => c.id === id)

        if (targetIndex === -1) {
          return
        }

        const target = currentComplaints[targetIndex]
        if (getNextAllowedStatus(target.status) === null) {
          // Already Resolved -> graceful no-op
          return
        }

        const updated = advanceComplaintStatus(target, now)

        const updatedComplaints = [...currentComplaints]
        updatedComplaints[targetIndex] = updated

        set({ complaints: updatedComplaints })
      },

      resetToSeedData: () => {
        set({
          complaints: getSeedComplaints(),
          storageRecoveredNotice: false,
          timeOffsetHours: 0,
          formulaMode: 'baseline',
          tieBreakOrder: 'age-first',
        })
      },

      injectTieBreakDemo: () => {
        const now = Date.now()
        const currentComplaints = get().complaints

        const id1 = generateNextId(currentComplaints)
        const demo1: Complaint = {
          id: id1,
          category: 'Wi-Fi', // Weight 2
          description: 'Library reading hall router 5GHz packet drops and connection loss',
          status: 'Raised',
          submittedAt: now - 48 * 3600000, // 48h -> age 2 -> Score = 2 + 2 = 4
          updatedAt: now,
          history: [{ from: null, to: 'Raised', changedAt: now - 48 * 3600000 }],
        }

        const id2 = generateNextId([...currentComplaints, demo1])
        const demo2: Complaint = {
          id: id2,
          category: 'Classroom', // Weight 1
          description: 'Lecture Hall 101 wireless microphone receiver continuous interference',
          status: 'Raised',
          submittedAt: now - 72 * 3600000, // 72h -> age 3 -> Score = 1 + 3 = 4
          updatedAt: now,
          history: [{ from: null, to: 'Raised', changedAt: now - 72 * 3600000 }],
        }

        set({
          complaints: [demo2, demo1, ...currentComplaints],
        })
      },

      importComplaints: (rawItems: unknown[]) => {
        let added = 0
        let rejected = 0
        let renamed = 0

        const workingList = [...get().complaints]

        for (const item of rawItems) {
          if (!isValidComplaintRecord(item)) {
            rejected++
            continue
          }

          const hasCollision = workingList.some((c) => c.id === item.id)
          let finalId = item.id

          if (hasCollision) {
            finalId = generateNextId(workingList)
            renamed++
          }

          const resolvedItem: Complaint = {
            ...item,
            id: finalId,
          }

          workingList.push(resolvedItem)
          added++
        }

        set({ complaints: workingList })
        return { added, rejected, renamed }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setSortBy: (sortBy) => set({ sortBy }),
      setTimeOffsetHours: (hours: number) =>
        set({ timeOffsetHours: Math.max(0, Math.min(168, Math.round(hours))) }),
      setFormulaMode: (mode) => set({ formulaMode: mode }),
      setTieBreakOrder: (order) => set({ tieBreakOrder: order }),
      setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),
      dismissStorageRecoveredNotice: () => set({ storageRecoveredNotice: false }),
      updateCurrentTime: () => set({ currentTime: Date.now() }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeStorageEngine),
      // CRITICAL: Partialize ensures ONLY complaints is stored.
      partialize: (state) => ({ complaints: state.complaints }),
      merge: (persistedState: unknown, currentState: ComplaintStoreState): ComplaintStoreState => {
        // If storage is completely empty (first launch), use default seed data without warning
        if (!persistedState || typeof persistedState !== 'object') {
          return {
            ...currentState,
            complaints: currentState.complaints.length
              ? currentState.complaints
              : getSeedComplaints(),
            storageRecoveredNotice: false,
          }
        }

        const candidate = persistedState as {
          complaints?: unknown
          _corrupt?: boolean
        }

        let recovered = candidate._corrupt === true
        let finalComplaints: Complaint[] = []

        if (!Array.isArray(candidate.complaints)) {
          recovered = true
          finalComplaints = getSeedComplaints()
        } else {
          const valid = candidate.complaints.filter(isValidComplaintRecord)

          if (valid.length !== candidate.complaints.length) {
            recovered = true
          }

          if (valid.length === 0) {
            recovered = true
            finalComplaints = getSeedComplaints()
          } else {
            finalComplaints = valid
          }
        }

        return {
          ...currentState,
          complaints: finalComplaints,
          storageRecoveredNotice: recovered,
        }
      },
    }
  )
)

/**
 * 30-second interval hook for synchronized time updates and window focus rehydration.
 */
export function useStoreSync() {
  const updateCurrentTime = useComplaintStore((state) => state.updateCurrentTime)

  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime()
    }, 30000)

    const handleFocus = () => {
      void useComplaintStore.persist.rehydrate()
      updateCurrentTime()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      window.addEventListener('storage', handleFocus)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('storage', handleFocus)
      }
    }
  }, [updateCurrentTime])
}
