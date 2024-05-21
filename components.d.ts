import Calendar from 'primevue/calendar'

declare module 'vue' {
  export interface GlobalComponents {
    'AppCalendar': typeof Calendar
  }
}