<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFirestore, collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import type { IInterview } from '@/interfaces'
import { useConfirm } from 'primevue/useconfirm'

const userStore = useUserStore()
const db = getFirestore()
const confirm = useConfirm()

const interviews = ref<IInterview[]>([])
const isLoading = ref<boolean>(true)

const getAllInterviews = async <T extends IInterview>(): Promise<T[]> => {
  const getData = query(collection(db, `users/${userStore.userId}/interviews`), orderBy('createdAt', 'desc'))
  const listDocs = await getDocs(getData)

  return listDocs.docs.map(doc => doc.data() as T)
}

const confirmRemoveInterview = async (id: string): Promise<void> => {
  confirm.require({
    message: 'Вы хотите удалить собеседование?',
    header: 'Удалить собеседование',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',

    accept: async () => {
      isLoading.value = true
      await deleteDoc(doc(db, `users/${userStore.userId}/interviews`, id))
      const listInterviews: Array<IInterview> = await getAllInterviews()
      interviews.value = [...listInterviews]
      isLoading.value = false
    }
  })
}

onMounted(async () => {
  const listInterviews: Array<IInterview> = await getAllInterviews()
  interviews.value = [...listInterviews]
  isLoading.value = false
})

</script>

<template>
  <AppDialog/>
  <AppSpinner v-if="isLoading" />
  <AppMessage v-else-if ="!isLoading && !interviews.length" severity="info">
    Нет добавленных собеседований
  </AppMessage>
  <div v-else>
    <h1>Список собеседований</h1>
    <AppDataTable :value="interviews">
      <AppColumn field="company" header="Компания"></AppColumn>
      <AppColumn field="vacancyLink" header="Ссылка на вакансию">
        <template #body="slotProps">
          <a :href="slotProps.data.vacancyLink" target="_blank">{{ slotProps.data.vacancyLink }}</a>
        </template>
      </AppColumn>
      <AppColumn field="hrName" header="Имя HR"></AppColumn>
      <AppColumn header="Контакты">
        <template #body="slotProps">
          <div class="contacts">
            <a
              class="contacts__telegram"
              v-if="slotProps.data.contactTelegram"
              :href="`https://t.me/${slotProps.data.contactTelegram}`"
              target="_blank"
            >
              <span class="contacts__icon pi pi-telegram"></span>
            </a>
            <a
              class="contacts__whatsapp"
              v-if="slotProps.data.contactWhatsApp"
              :href="`https://wa.me/${slotProps.data.contactWhatsApp}`"
              target="_blank"
            >
              <span class="contacts__icon pi pi-whatsapp"></span>
            </a>
            <a
              class="contacts__phone"
              v-if="slotProps.data.contactPhone"
              :href="`tel:${slotProps.data.contactPhone}`"
              target="_blank"
            >
              <span class="contacts__icon pi pi-phone"></span>
            </a>
          </div>
        </template>
      </AppColumn>
      <AppColumn header="Пройденные этапы">
        <template #body="slotProps">
          <span v-if="!slotProps.data.stages">Не заполнено</span>
          <div v-else class="interview-stages">
            <AppBadge
              v-for="(stage, i) in slotProps.data.stages"
              :key="i"
              :value="i + 1"
              rounded
              v-tooltip.top="stage.name"
            />
          </div>
        </template>
      </AppColumn>
      <AppColumn header="Зарплатная вилка">
        <template #body="slotProps">
          <span v-if="!slotProps.data.salaryFrom">Не заполнено</span>
          <span v-else>{{slotProps.data.salaryFrom}} - {{slotProps.data.salaryTo}}</span>
        </template>
      </AppColumn>
      <AppColumn header="Результат">
        <template #body="slotProps">
          <span v-if="!slotProps.data.result">Не заполнено</span>
          <template v-else>
            <AppBadge
              :value="slotProps.data.result === 'Offer' ? 'Оффер' : 'Отказ'"
              :severity="slotProps.data.result === 'Offer' ? 'success' : 'danger'"/>
          </template>
        </template>
      </AppColumn>
      <AppColumn>
        <template #body="slotProps">
          <div class="flex gap-2">
            <RouterLink :to="`/interview/${slotProps.data.id}`">
              <AppButton icon="pi pi-pencil" text severity="info"/>
            </RouterLink>
            <AppButton
              icon="pi pi-trash"
              text
              severity="danger"
              @click="confirmRemoveInterview(slotProps.data.id)"/>
          </div>
        </template>
      </AppColumn>
    </AppDataTable>
  </div>
</template>

<style scoped>
.contacts {
  display: flex;
  align-items: center;
  gap: 16px;
}

.contacts__telegram {
  color: #0088cc;
}

.contacts__whatsapp {
  color: #25d366;
}

.contacts__phone {
  color: #371777;
}

.interview-stages {
  display: flex;
  gap: 5px;
}
</style>