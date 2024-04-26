import type { ComputedRef } from 'vue'

export interface IMenuItem {
  label: string
  icon: string
  path: string
  show: ComputedRef<boolean>
}

export interface IInterview {
  id: string
  company: string
  vacancyLink: string
  hrName: string
  contactTelegram?: string
  contactWhatsApp?: string
  contactPhone?: string
  createdAt: Date
}

