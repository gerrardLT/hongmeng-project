import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Booking, BookingStatus } from '@/types/models'
import { dbGetAll, dbSet } from '@/utils/db'

const DRAFT_KEY = 'sealcraft_booking_draft'
const COLLECTION = 'bookings'

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in-progress']

export const useBookingStore = defineStore('booking', () => {
  // state
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const draftBooking = ref<Partial<Booking>>({})

  // getters
  const activeBookings = computed(() => {
    return bookings.value
      .filter((b) => ACTIVE_STATUSES.includes(b.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const completedBookings = computed(() => {
    return bookings.value
      .filter((b) => b.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  const pendingCount = computed(() => {
    return bookings.value.filter((b) => b.status === 'pending').length
  })

  // actions
  function loadBookings() {
    try {
      bookings.value = dbGetAll<Booking>(COLLECTION)
    } catch (e) {
      console.error('loadBookings error:', e)
    }
  }

  function addBooking(booking: Booking) {
    bookings.value.unshift(booking)
    try {
      dbSet<Booking>(COLLECTION, booking.bookingId, booking)
    } catch (e) {
      console.error('addBooking error:', e)
    }
  }

  function updateBookingStatus(bookingId: string, status: BookingStatus) {
    const index = bookings.value.findIndex((b) => b.bookingId === bookingId)
    if (index !== -1) {
      const updated: Booking = {
        ...bookings.value[index],
        status,
        updatedAt: new Date().toISOString()
      }
      bookings.value[index] = updated
      if (currentBooking.value?.bookingId === bookingId) {
        currentBooking.value = updated
      }
      try {
        dbSet<Booking>(COLLECTION, bookingId, updated)
      } catch (e) {
        console.error('updateBookingStatus error:', e)
      }
    }
  }

  function setCurrentBooking(booking: Booking | null) {
    currentBooking.value = booking
  }

  function saveDraft(draft: Partial<Booking>) {
    draftBooking.value = { ...draftBooking.value, ...draft }
    try {
      uni.setStorageSync(DRAFT_KEY, draftBooking.value)
    } catch (e) {
      console.error('saveDraft error:', e)
    }
  }

  function loadDraft() {
    try {
      const draft = uni.getStorageSync(DRAFT_KEY) as Partial<Booking> | undefined
      if (draft) {
        draftBooking.value = draft
      }
    } catch (e) {
      console.error('loadDraft error:', e)
    }
  }

  function clearDraft() {
    draftBooking.value = {}
    try {
      uni.removeStorageSync(DRAFT_KEY)
    } catch (e) {
      console.error('clearDraft error:', e)
    }
  }

  return {
    bookings,
    currentBooking,
    draftBooking,
    activeBookings,
    completedBookings,
    pendingCount,
    loadBookings,
    addBooking,
    updateBookingStatus,
    setCurrentBooking,
    saveDraft,
    loadDraft,
    clearDraft
  }
})
