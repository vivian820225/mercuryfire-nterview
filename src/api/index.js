import { api } from 'src/boot/axios';

function getCrudTest() {
  return api.get('crudTest/a');
}

function postCrudTest(data) {
  return api.post('crudTest', data);
}

function patchCrudTest(data) {
  return api.patch('crudTest', data);
}

function deleteCrudTest(id) {
  return api.delete(`crudTest/${id}`);
}

export { getCrudTest, postCrudTest, patchCrudTest, deleteCrudTest };
