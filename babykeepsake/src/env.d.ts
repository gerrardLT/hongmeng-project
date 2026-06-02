/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.uts' {
  const content: any
  export default content
}

declare module '@/uni_modules/babykeepsake-widget/utssdk/app-harmony/index.uts' {
  export interface BookingWidgetData {
    studioName: string
    bookingTime: string
    keepsakeType: string
  }
  export interface ProgressWidgetData {
    currentStage: string
    progressPercent: number
    estimatedCompletion: string
  }
  export interface MilestoneWidgetData {
    milestoneName: string
    babyAge: string
    nextCollectTime: string
  }
  export function updateWidget(data: any): void
}

declare function require(path: string): any
