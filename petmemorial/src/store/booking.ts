import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Booking, BookingStatus } from '@/types/models'

const DRAFT_KEY = 'petmemorial_booking_draft'

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in-progress']

export const useBookingStore = defineStore('booking', () => {
  // state
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const bookingDraft = ref<Partial<Booking>>({})

  // getters
  const activeBookings = computed(() => {
    return bookings.value
      .filter((b) => ACTIVE_STATUSES.includes(b.status))
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  const completedBookings = computed(() => {
    return bookings.value
      .filter((b) => b.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  const cancelledBookings = computed(() => {
    return bookings.value
      .filter((b) => b.status === 'cancelled')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  // actions
  function setBookings(list: Booking[]) {
    bookings.value = list
  }

  function addBooking(booking: Booking) {
    bookings.value.unshift(booking)
  }

  function updateBooking(bookingId: string, data: Partial<Booking>) {
    const index = bookings.value.findIndex((b) => b.bookingId === bookingId)
    if (index !== -1) {
      bookings.value[index] = { ...bookings.value[index], ...data, updatedAt: Date.now() }
      if (currentBooking.value?.bookingId === bookingId) {
        currentBooking.value = { ...currentBooking.value, ...data, updatedAt: Date.now() }
      }
    }
  }

  function cancelBooking(bookingId: string) {
    updateBooking(bookingId, { status: 'cancelled' })
  }

  function setCurrentBooking(booking: Booking | null) {
    currentBooking.value = booking
  }

  function saveDraft(draft: Partial<Booking>) {
    bookingDraft.value = { ...bookingDraft.value, ...draft }
    try {
      uni.setStorageSync(DRAFT_KEY, bookingDraft.value)
    } catch (e) {
      console.error('saveDraft error:', e)
    }
  }

  function loadDraft() {
    try {
      const draft = uni.getStorageSync(DRAFT_KEY) as Partial<Booking> | undefined
      if (draft) {
        bookingDraft.value = draft
      }
    } catch (e) {
      console.error('loadDraft error:', e)
    }
  }

  function clearDraft() {
    bookingDraft.value = {}
    try {
      uni.removeStorageSync(DRAFT_KEY)
    } catch (e) {
      console.error('clearDraft error:', e)
    }
  }

  return {
    bookings,
    currentBooking,
    bookingDraft,
    activeBookings,
    completedBookings,
    cancelledBookings,
    setBookings,
    addBooking,
    updateBooking,
    cancelBooking,
    setCurrentBooking,
    saveDraft,
    loadDraft,
    clearDraft
  }
})
