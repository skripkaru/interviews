import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const userId = ref<string>('')
  const userName = ref<string>('')
  const userEmail = ref<string>('')
  const userPhoto = ref<string>('')

  const setUser = (newUser: User | null) => {
    if (newUser) {
      userId.value = newUser.uid || ''
      userName.value = newUser.displayName || ''
      userEmail.value = newUser.email || ''
      userPhoto.value = newUser.photoURL || ''
    } else {
      userId.value = ''
      userName.value = ''
      userEmail.value = ''
      userPhoto.value = ''
    }
  }

  return {
    userId,
    userName,
    userEmail,
    userPhoto,
    setUser
  }
})
