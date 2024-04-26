<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IInterview } from '@/interfaces'
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth'
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'vue-router'

const db = getFirestore();
const router = useRouter()
const company = ref<string>('')
const vacancyLink = ref<string>('')
const hrName = ref<string>('')
const contactTelegram = ref<string>('')
const contactWhatsApp = ref<string>('')
const contactPhone = ref<string>('')

const loading = ref<boolean>(false)

const disabledSaveButton = computed<boolean>(() => {
  return !(company.value && vacancyLink.value && hrName.value)
})

const addNewInterview = async (): Promise<void> => {
  loading.value = true

  const payload: IInterview = {
    id: uuidv4(),
    company: company.value,
    vacancyLink: vacancyLink.value,
    hrName: hrName.value,
    contactTelegram: contactTelegram.value,
    contactWhatsApp: contactWhatsApp.value,
    contactPhone: contactPhone.value,
    createdAt: new Date(),
  }

  const userId = getAuth().currentUser?.uid

  if(userId) {
    await setDoc(doc(db, `users/${userId}/interviews`, payload.id), payload).then(() => {
      router.push('/list')
    })
  }
}
</script>

<template>
  <div class="content-interview">
    <AppCard>
      <template #title>Новое собеседование</template>
      <template #content>
        <AppInputText class="input mb-3" placeholder="Компания" v-model="company" />
        <AppInputText
          v-model="vacancyLink"
          class="input mb-3"
          placeholder="Описание вакансии (ссылка)"
        />
        <AppInputText v-model="hrName" class="input mb-3" placeholder="Контакт (имя)" />
        <AppInputText
          v-model="contactTelegram"
          class="input mb-3"
          placeholder="Telegram username HR"
        />
        <AppInputText
          v-model="contactWhatsApp"
          class="input mb-3"
          placeholder="WhatsApp телефон HR"
        />
        <AppInputText v-model="contactPhone" class="input mb-3" placeholder="Телефон HR" />
        <AppButton
          @click="addNewInterview"
          label="Создать собеседование"
          :disabled="disabledSaveButton"
          :loading="loading"
        />
      </template>
    </AppCard>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
}

.content-interview {
  max-width: 600px;
  margin: auto;
}
</style>
