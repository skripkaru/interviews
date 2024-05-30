<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import type { IInterview, IStage } from '@/interfaces'
import { Plus, Delete, Check } from '@element-plus/icons-vue'

const db = getFirestore()
const useStore = useUserStore()
const route = useRoute()
const { startLoading, stopLoading } = useLoading()


const interview = ref<IInterview>()
const docref = doc(db, `users/${useStore.userId}/interviews`, route.params.id as string)

const getData = async () => {
  startLoading()
  const docSnap = await getDoc(docref)

  if (docSnap.exists()) {
    const data = docSnap.data() as IInterview

    if (data.stages && data.stages.length) {
      data.stages = data.stages.map((stage: IStage) => {
        if (stage.date && stage.date instanceof Timestamp) {
          return {
            ...stage,
            date: stage.date.toDate()
          }
        }
        return stage
      })
    }
    interview.value = data
  }
  stopLoading()
}

const addStage = () => {
  if (interview.value) {
    if (!interview.value.stages) {
      interview.value.stages = []
    }
    interview.value.stages.push({ name: '', date: null, description: '' })
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
  startLoading()
  await updateDoc(docref, { ...interview.value })
  await getData()
}

onMounted(async () => await getData())
</script>

<template>
  <el-form v-if="interview?.id" label-position="top">
    <el-card class="card">
      <template #header>
        <h1 class="title">Собеседование в {{ interview.company }}</h1>
      </template>
      <el-form-item label="Компания">
        <el-input v-model="interview.company" placeholder="Компания" />
      </el-form-item>
      <el-form-item label="Ссылка на вакансию">
        <el-input v-model="interview.vacancyLink" placeholder="Ссылка на вакансию" />
      </el-form-item>
      <el-form-item label="Имя HR">
        <el-input v-model="interview.hrName" placeholder="Имя HR" />
      </el-form-item>
      <el-form-item label="Telegram HR">
        <el-input v-model="interview.contactTelegram" placeholder="Telegram HR" />
      </el-form-item>
      <el-form-item label="WhatsApp HR">
        <el-input v-model="interview.contactWhatsApp" placeholder="WhatsApp HR" />
      </el-form-item>
      <el-form-item label="Телефон HR">
        <el-input v-model="interview.contactPhone" placeholder="Телефон HR" />
      </el-form-item>
      <el-form-item label="Зарплатная вилка">
        <el-col :span="11">
          <el-input-number
            style="width: 100%"
            v-model="interview.salaryFrom"
            :controls="false"
            placeholder="От"
          />
        </el-col>
        <el-col :span="2"></el-col>
        <el-col :span="11">
          <el-input-number
            style="width: 100%"
            v-model="interview.salaryTo"
            :controls="false"
            placeholder="До"
          />
        </el-col>
      </el-form-item>
      <template v-if="interview.stages">
        <h2>Этапы</h2>
        <el-card
          class="stage"
          v-for="(stage, index) in interview.stages"
          :key="index"
          shadow="never"
        >
          <el-form-item label="Название этапа">
            <el-input v-model="stage.name" placeholder="Название этапа" />
          </el-form-item>
          <el-form-item label="Дата прохождения этапа">
            <el-date-picker
              style="width: 100%"
              v-model="stage.date"
              format="DD.MM.YYYY"
              placeholder="Дата прохождения этапа"
            />
          </el-form-item>
          <el-form-item label="Комментарий">
            <el-input type="textarea" v-model="stage.description" placeholder="Комментарий" />
          </el-form-item>
          <el-button type="danger" :icon="Delete" @click="removeStage">Удалить этап</el-button>
        </el-card>
      </template>
      <template #footer>
        <el-form-item>
          <el-radio-group v-model="interview.result">
            <el-radio value="Refusal">Отказ</el-radio>
            <el-radio value="Offer">Оффер</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-button type="info" :icon="Plus" @click="addStage">Добавить этап</el-button>
        <el-button type="primary" :icon="Check" @click="saveInterview">Сохранить</el-button>
      </template>
    </el-card>
  </el-form>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  margin: 0;
}

.stage {
  margin-bottom: 16px;
}
</style>
