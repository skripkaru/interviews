import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const userId = ref<string>('')
  const userName = ref<string>('')

  const setUser = (newUser: User | null) => {
    user.value = newUser
    userId.value = newUser?.uid || ''
    userName.value = newUser?.displayName || 'Аноним'
  }

  return {
    user,
    userId,
    userName,
    setUser
  }
})
