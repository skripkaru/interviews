<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast';

const email = ref<string>('')
const password = ref<string>('')
const isLogin = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const router = useRouter()
const toast = useToast();

const subtitleText = computed<string>(() => {
  return isLogin.value ? 'Аккаунта еще нет?' : 'Уже есть аккаунт?'
})

const linkAccountText = computed<string>(() => {
  return isLogin.value ? 'Создайте сейчас?' : 'Войдите в него'
})

const submitButtonText = computed<string>(() => {
  return isLogin.value ? 'Вход' : 'Регистрация'
})

const toggleAuth = () => {
  isLogin.value = !isLogin.value
}

const signUp = async (): Promise<void> => {
  isLoading.value = true
  try {
    await createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    router.push('/')
  } catch (error: unknown) {
    if(error instanceof Error) {
      toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000})
    }
  } finally {
     isLoading.value = false
  }
}

const signIn = async (): Promise<void> => {
  isLoading.value = true
  try {
    await signInWithEmailAndPassword(getAuth(), email.value, password.value)
    router.push('/')
  } catch (error: unknown) {
    if(error instanceof Error) {
      toast.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000})
    }
  } finally {
    isLoading.value = false
  }
}

const submitForm = () => {
  if(isLogin.value) {
    signIn()
  } else {
    signUp()
  }
}

</script>

<template>
  <AppToast position="bottom-right" />
  <div class="flex justify-content-center p-2">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <div class="text-center mb-3">
        <div class="text-900 text-3xl font-medium mb-3">Приветствую!</div>
        <span class="text-600 font-medium line-height-3">{{ subtitleText }}</span>
        <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer" @click="toggleAuth">
          {{ linkAccountText }}
        </a>
      </div>
      <form @submit.prevent="submitForm">
        <label for="email1" class="block text-900 font-medium mb-2">Email</label>
        <AppInputText v-model="email" id="email1" type="email" class="w-full mb-3" />
        <label for="password1" class="block text-900 font-medium mb-2">Пароль</label>
        <AppInputText v-model="password" id="password1" type="password" class="w-full mb-3" />
        <AppButton
          :label="submitButtonText"
          type="submit"
          icon="pi pi-user"
          :loading="isLoading"
          class="w-full"
        ></AppButton>
      </form>
    </div>
  </div>
</template>
