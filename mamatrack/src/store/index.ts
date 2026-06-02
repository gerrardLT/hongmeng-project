import { createPinia } from 'pinia'

export const pinia = createPinia()
export { useUserStore } from './user'
export { usePregnancyStore } from './pregnancy'
export { useRecordStore } from './record'
export { useReminderStore } from './reminder'
export { useFamilyStore } from './family'
