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

declare module '@/uni_modules/glasscraft-widget/utssdk/app-harmony/index.uts' {
  export interface BookingWidgetData {
    studioName: string
    bookingTime: string
    projectName: string
  }
  export interface ArtworkWidgetData {
    artworkPhoto: string
    studioName: string
    createdDate: string
  }
  export function updateWidget(data: any): void
}

declare function require(path: string): any
