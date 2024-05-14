<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import type { IInterview, IStage } from '@/interfaces'
import dayjs from 'dayjs'

const db = getFirestore()
const useStore = useUserStore()
const route = useRoute()

const isLoading = ref<boolean>(true)
const interview = ref<IInterview>()

const docref = doc(db, `users/${useStore.userId}/interviews`, route.params.id as string)

const getData = async () => {
  isLoading.value = true
  const docSnap = await getDoc(docref)
  interview.value = docSnap.data() as IInterview
  isLoading.value = false
}

const addStage = () => {
  if (interview.value) {
    if (!interview.value.stages) {
      interview.value.stages = []
    }
    interview.value.stages.push({ name: '', date: '', description: '' })
  }
}

const removeStage = (index: number) => {
  if (interview.value) {
    if (interview.value.stages) {
      interview.value.stages.splice(index, 1)
    }
  }
}

const saveInterview = async (): Promise<void> => {
  isLoading.value = true
  await updateDoc(docref, {...interview.value})
  await getData()
}

const saveDateStage = (index: number) => {
  if(interview.value?.stages && interview.value.stages.length) {
    const date = interview.value.stages[index].date
    interview.value.stages[index].date = dayjs(date).format('DD.MM.YYYY')
  }
}

onMounted(async () => await getData())
</script>

<template>
  <AppSpinner v-if="isLoading" />
  <div v-else-if="interview?.id && !isLoading" class="content-interview">
    <AppCard>
      <template #title>Собеседование в компанию {{ interview.company }}</template>
      <template #content>
        <div class="flex flex-column gap-2">
          <label for="company">Компания</label>
          <AppInputText id="company" class="input mb-3" v-model="interview.company" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="vacancyLink">Описание вакансии (ссылка)</label>
          <AppInputText id="vacancyLink" class="input mb-3" v-model="interview.vacancyLink" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="hrName">Контакт (имя)</label>
          <AppInputText id="hrName" class="input mb-3" v-model="interview.hrName" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactTelegram">Telegram username HR</label>
          <AppInputText id="contactTelegram" class="input mb-3" v-model="interview.contactTelegram" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactWhatsApp">Whatsapp HR</label>
          <AppInputText id="contactWhatsApp" class="input mb-3" v-model="interview.contactWhatsApp" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactPhone">Телефон HR</label>
          <AppInputText id="contactPhone" class="input mb-3" v-model="interview.contactPhone" />
        </div>
        <div class="flex flex-wrap gap-3 p-fluid mb-3">
          <div class="flex-auto">
            <AppInputNumber inputId="salaryFrom" placeholder="Зарплатная вилка от" v-model="interview.salaryFrom" />
          </div>
          <div class="flex-auto">
            <AppInputNumber inputId="salaryTo" placeholder="Зарплатная вилка до" v-model="interview.salaryTo" />
          </div>
        </div>
        <AppButton class="mb-3" label="Добавить этап" severity="info" icon="pi pi-plus" @click="addStage" />
        <template v-if="interview.stages">
          <div v-for="(stage, index) in interview.stages" :key="index" class="interview-stage">
            <div class="flex flex-column gap-2">
              <label :for="`stage-name-${index}`">Название этапа</label>
              <AppInputText :id="`stage-name-${index}`" class="input mb-3" v-model="stage.name" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="`stage-date-${index}`">Дата прохождения этапа</label>
              <AppCalendar :id="`stage-date-${index}`" class="input mb-3" dateFormat="dd.mm.yy" v-model="stage.date" @date-select="saveDateStage(index)" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="`stage-description-${index}`">Комментарий</label>
              <AppTextarea :id="`stage-description-${index}`" class="input mb-3" rows="5" v-model="stage.description" />
            </div>
            <AppButton label="Удалить этап" severity="danger" icon="pi pi-trash" @click="removeStage" />
          </div>
        </template>
        <div class="flex flex-wrap gap-3 mb-3">
          <div class="flex align-items-center">
            <AppRadioButton inputId="interviewResult1" name="result" value="Refusal" v-model="interview.result" />
            <label for="interviewResult1" class="ml-2">Отказ</label>
          </div>
          <div class="flex align-items-center">
            <AppRadioButton inputId="interviewResult2" name="result" value="Offer" v-model="interview.result" />
            <label for="interviewResult2" class="ml-2">Оффер</label>
          </div>
        </div>
        <AppButton label="Сохранить" icon="pi pi-save" @click="saveInterview" />
      </template>
    </AppCard>
  </div>
</template>

<style scoped>
.content-interview {
  max-width: 600px;
  margin: auto;
}

.input {
  width: 100%;
}

.interview-stage {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
