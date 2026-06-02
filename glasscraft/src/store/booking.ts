import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Booking } from '@/types/models'

const STORAGE_KEY = 'glasscraft_bookings'

interface BookingStorageState {
  bookingList: Booking[]
  currentBooking: Booking | null
}

export const useBookingStore = defineStore('booking', () => {
  // state
  const bookingList = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)
  const loading = ref(false)

  // getters
  const pendingBookings = computed(() => {
    return bookingList.value
      .filter((b) => b.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  const confirmedBookings = computed(() => {
    return bookingList.value
      .filter((b) => b.status === 'confirmed')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  const completedBookings = computed(() => {
    return bookingList.value
      .filter((b) => b.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  const upcomingBooking = computed(() => {
    const now = Date.now()
    return confirmedBookings.value
      .filter((b) => new Date(b.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null
  })

  // 持久化到本地存储
  function persist() {
    const state: BookingStorageState = {
      bookingList: bookingList.value,
      currentBooking: currentBooking.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist bookings state error:', e)
    }
  }

  // actions
  function addBooking(booking: Booking) {
    bookingList.value.unshift(booking)
    persist()
  }

  function updateBooking(bookingId: string, data: Partial<Booking>) {
    const index = bookingList.value.findIndex((b) => b.bookingId === bookingId)
    if (index !== -1) {
      bookingList.value[index] = { ...bookingList.value[index], ...data, updatedAt: Date.now() }
      if (currentBooking.value?.bookingId === bookingId) {
        currentBooking.value = { ...currentBooking.value, ...data, updatedAt: Date.now() }
      }
      persist()
    }
  }

  function removeBooking(bookingId: string) {
    bookingList.value = bookingList.value.filter((b) => b.bookingId !== bookingId)
    if (currentBooking.value?.bookingId === bookingId) {
      currentBooking.value = null
    }
    persist()
  }

  function setCurrentBooking(booking: Booking | null) {
    currentBooking.value = booking
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as BookingStorageState | undefined
      if (state) {
        bookingList.value = state.bookingList || []
        currentBooking.value = state.currentBooking || null
      }
    } catch (e) {
      console.error('init bookings state error:', e)
    }
  }

  return {
    bookingList,
    currentBooking,
    loading,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    upcomingBooking,
    addBooking,
    updateBooking,
    removeBooking,
    setCurrentBooking,
    init,
    persist
  }
})
