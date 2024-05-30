<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where
} from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import type { IInterview } from '@/interfaces'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Phone, Promotion, Message } from '@element-plus/icons-vue'

const userStore = useUserStore()
const db = getFirestore()
const { startLoading, stopLoading } = useLoading()
const interviews = ref<IInterview[]>([])
const selectedFilterResult = ref<string>('')

onMounted(async () => {
  startLoading()
  interviews.value = await getAllInterviews()
  stopLoading()
})

const submitFilter = async (): Promise<void> => {
  startLoading()
  interviews.value = await getAllInterviews(true)
  stopLoading()
}

const clearFilter = async (): Promise<void> => {
  startLoading()
  interviews.value = await getAllInterviews()
  stopLoading()
}

const getAllInterviews = async <T extends IInterview>(isFilter?: boolean): Promise<T[]> => {
  let getData

  if (isFilter) {
    getData = query(
      collection(db, `users/${userStore.userId}/interviews`),
      orderBy('createdAt', 'desc'),
      where('result', '==', selectedFilterResult.value)
    )
  } else {
    getData = query(
      collection(db, `users/${userStore.userId}/interviews`),
      orderBy('createdAt', 'desc')
    )
  }

  const listDocs = await getDocs(getData)

  return listDocs.docs.map((doc) => doc.data() as T)
}

const confirmRemoveInterview = async (id: string): Promise<void> => {
  const done = async () => {
    startLoading()
    await deleteDoc(doc(db, `users/${userStore.userId}/interviews`, id))
    const listInterviews: Array<IInterview> = await getAllInterviews()
    interviews.value = [...listInterviews]
    stopLoading()
  }

  ElMessageBox.confirm('Вы хотите удалить собеседование?', 'Удалить собеседование', {
    confirmButtonText: 'Удалить',
    cancelButtonText: 'Отмена',
    type: 'warning'
  })
    .then(() => {
      console.log('confirmRemoveInterview', id)
      done()
      ElMessage({
        type: 'success',
        message: 'Удаление завершено'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Удаление отменено'
      })
    })
}
</script>

<template>
  <el-dialog />
  <el-empty v-if="!interviews.length" description="Нет данных" />
  <el-card v-else>
    <template #header>
      <div class="header">
        <h1 class="title">Список собеседований</h1>
        <div class="filter">
          <el-radio-group v-model="selectedFilterResult">
            <el-radio value="Refusal">Отказ</el-radio>
            <el-radio value="Offer">Оффер</el-radio>
          </el-radio-group>
          <el-button-group>
            <el-button @click="submitFilter" :disabled="!selectedFilterResult">Применить</el-button>
            <el-button @click="clearFilter" :disabled="!selectedFilterResult">Сбросить</el-button>
          </el-button-group>
        </div>
      </div>
    </template>
    <el-table :data="interviews">
      <el-table-column prop="company" label="Компания" />
      <el-table-column label="Ссылка на вакансию">
        <template #default="scope">
          <el-link type="primary" :href="scope.row.vacancyLink" target="_blank">{{
              scope.row.vacancyLink
            }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="hrName" label="Имя HR" />
      <el-table-column label="Контакты">
        <template #default="scope">
          <span
            v-if="
              !scope.row.contactTelegram && !scope.row.contactTelegram && !scope.row.contactPhone
            "
          >Нет данных</span
          >
          <div v-else class="contacts">
            <el-link
              :underline="false"
              v-if="scope.row.contactTelegram"
              :href="`https://t.me/${scope.row.contactTelegram}`"
              target="_blank"
            >
              <el-icon>
                <Promotion />
              </el-icon>
            </el-link>
            <el-link
              :underline="false"
              v-if="scope.row.contactWhatsApp"
              :href="`https://wa.me/${scope.row.contactWhatsApp}`"
              target="_blank"
            >
              <el-icon>
                <Message />
              </el-icon>
            </el-link>
            <el-link
              :underline="false"
              v-if="scope.row.contactPhone"
              :href="`tel:${scope.row.contactPhone}`"
              target="_blank"
            >
              <el-icon>
                <Phone />
              </el-icon>
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Пройденные этапы">
        <template #default="scope">
          <span v-if="!scope.row.stages">Нет данных</span>
          <el-tooltip
            v-else
            v-for="(stage, i) in scope.row.stages"
            :key="i"
            effect="dark"
            :content="stage.name"
            placement="top"
          >
            <el-button size="small" circle>{{ i + 1 }}</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="Зарплатная вилка">
        <template #default="scope">
          <span v-if="!scope.row.salaryFrom">Нет данных</span>
          <span v-else>{{ scope.row.salaryFrom }} - {{ scope.row.salaryTo }} ₽</span>
        </template>
      </el-table-column>
      <el-table-column label="Результат">
        <template #default="scope">
          <el-tag v-if="!scope.row.result" type="warning">В процессе</el-tag>
          <el-tag v-else :type="scope.row.result === 'Offer' ? 'success' : 'danger'">
            {{ scope.row.result === 'Offer' ? 'Оффер' : 'Отказ' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Операции">
        <template #default="scope">
          <el-button link type="primary" @click="$router.push(`/interview/${scope.row.id}`)">
            <el-icon>
              <Edit />
            </el-icon>
          </el-button>
          <el-button link type="danger" @click="confirmRemoveInterview(scope.row.id)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
}

.filter {
  display: flex;
  align-items: center;
  gap: 16px;
}

.contacts {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
