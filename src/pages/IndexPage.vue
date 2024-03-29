<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <form ref="formRef" @submit.prevent="addData()" class="q-gutter-md">
        <div class="q-mb-xl">
          <q-input
            ref="nameRef"
            v-model="tempData.name"
            :rules="[rules.notEmpty]"
            label="姓名"
          />
          <q-input
            ref="ageRef"
            :rules="[rules.notEmpty, rules.isPositiveInteger]"
            v-model="tempData.age"
            label="年齡"
          />
          <q-btn
            color="primary"
            :loading="isLoading"
            class="q-mt-md"
            type="submit"
          >
            新增
          </q-btn>
        </div>
      </form>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>

      <!-- Edit -->
      <q-dialog v-model="isEdit" persistent>
        <q-card style="min-width: 320px">
          <q-card-section>
            <div class="text-h6">編輯</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input v-model="tempEditData.name" label="姓名" />
            <q-input v-model="tempEditData.age" label="年齡" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="取消" @click="isEdit = false" />
            <q-btn
              flat
              label="更新"
              :loading="isLoading"
              @click="
                editData({
                  id: tempEditData.id,
                  name: tempEditData.name,
                  age: Number(tempEditData.age),
                })
              "
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, useQuasar } from 'quasar';
import {
  deleteCrudTest,
  getCrudTest,
  patchCrudTest,
  postCrudTest,
} from 'src/api';
import { onMounted, ref } from 'vue';

interface btnType {
  label: string;
  icon: string;
  status: string;
}
const blockData = ref([]);
const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const $q = useQuasar();

const nameRef = ref();
const ageRef = ref();
const isEdit = ref(false);
const isLoading = ref(false);

const tempData = ref({
  name: '',
  age: '',
});

const tempEditData = ref({
  id: '',
  name: '',
  age: 0,
});

const rules = {
  notEmpty: (val) => !!val || '欄位不得為空白',
  isPositiveInteger: (val) => /^[0-9]+$/.test(val) || '欄位必須為正整數',
};

function handleClickOption(btn: btnType, data) {
  switch (btn.status) {
    case 'edit':
      tempEditData.value.id = data.id;
      tempEditData.value.name = data.name;
      tempEditData.value.age = Number(data.age);
      isEdit.value = true;
      break;
    case 'delete':
      deleteData(data.id);
      break;
  }
}

const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await getCrudTest();
    blockData.value = res.data.result;
  } catch (e) {
    $q.notify({
      icon: 'error',
      color: 'danger',
      message: '發生錯誤',
    });
  } finally {
    isLoading.value = false;
  }
};

const addData = async () => {
  isLoading.value = true;
  nameRef.value.validate();
  ageRef.value.validate();

  try {
    const params = {
      name: tempData.value.name,
      age: Number(tempData.value.age),
    };

    const res = await postCrudTest(params);

    $q.notify({
      icon: 'done',
      color: 'positive',
      message: '送出成功',
    });

    await fetchData();
  } catch (error) {
    $q.notify({
      icon: 'error',
      color: 'danger',
      message: '發生錯誤',
    });
  } finally {
    isLoading.value = false;
  }
};

const editData = async (data) => {
  isLoading.value = true;
  try {
    const res = await patchCrudTest(data);
    $q.notify({
      icon: 'done',
      color: 'positive',
      message: '送出成功',
    });
    await fetchData();
  } catch (error) {
    $q.notify({
      icon: 'error',
      color: 'danger',
      message: '發生錯誤',
    });
  } finally {
    isEdit.value = false;
    isLoading.value = false;
  }
};

const deleteData = async (id) => {
  isLoading.value = true;
  try {
    $q.dialog({
      title: '提示',
      message: '是否確定刪除該筆資料？',
      cancel: '取消',
    }).onOk(async () => {
      await deleteCrudTest(id);
      await fetchData();
      $q.notify({
        icon: 'done',
        color: 'positive',
        message: '刪除成功',
      });
    });
  } catch (error) {
    $q.notify({
      icon: 'error',
      color: 'danger',
      message: '發生錯誤',
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
