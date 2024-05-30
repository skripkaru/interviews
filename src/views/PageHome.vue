<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IInterview } from '@/interfaces'
import { v4 as uuidv4 } from 'uuid'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'

const userStore = useUserStore()
const db = getFirestore()
const router = useRouter()
const { startLoading, stopLoading } = useLoading()

const company = ref<string>('')
const vacancyLink = ref<string>('')
const hrName = ref<string>('')
const contactTelegram = ref<string>('')
const contactWhatsApp = ref<string>('')
const contactPhone = ref<string>('')

const disabledSaveButton = computed<boolean>(() => {
  return !(company.value && vacancyLink.value && hrName.value)
})

const addNewInterview = async (): Promise<void> => {
  startLoading()

  const payload: IInterview = {
    id: uuidv4(),
    company: company.value,
    vacancyLink: vacancyLink.value,
    hrName: hrName.value,
    contactTelegram: contactTelegram.value,
    contactWhatsApp: contactWhatsApp.value,
    contactPhone: contactPhone.value,
    createdAt: new Date()
  }

  if (userStore.userId) {
    await setDoc(doc(db, `users/${userStore.userId}/interviews`, payload.id), payload).then(() => {
      router.push('/list')
    })
  }
}
</script>

<template>
  <el-card class="card">
    <template #header>
      <h1 class="title">Новое собеседование</h1>
    </template>
    <el-form label-position="top">
      <el-form-item label="Компания">
        <el-input v-model="company" placeholder="Компания" />
      </el-form-item>
      <el-form-item label="Ссылка на вакансию">
        <el-input v-model="vacancyLink" placeholder="Ссылка на вакансию" />
      </el-form-item>
      <el-form-item label="Имя HR">
        <el-input v-model="hrName" placeholder="Имя HR" />
      </el-form-item>
      <el-form-item label="Telegram HR">
        <el-input v-model="contactTelegram" placeholder="Telegram HR" />
      </el-form-item>
      <el-form-item label="WhatsApp HR">
        <el-input v-model="contactWhatsApp" placeholder="WhatsApp HR" />
      </el-form-item>
      <el-form-item label="Телефон HR">
        <el-input v-model="contactPhone" placeholder="Телефон HR" />
      </el-form-item>
      <el-button
        type="primary"
        @click="addNewInterview"
        :disabled="disabledSaveButton"
      >
        Создать собеседование
      </el-button>
    </el-form>
  </el-card>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  margin: 0;
}
</style>
