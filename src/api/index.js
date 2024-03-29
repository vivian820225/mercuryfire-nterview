import axios from 'axios';

function getCrudTest() {
  return axios.get('api/crudTest/a');
}

function postCrudTest(data) {
  return axios.post('api/crudTest', data);
}

function patchCrudTest(data) {
  return axios.patch('api/crudTest', data);
}

function deleteCrudTest(id) {
  return axios.delete(`api/crudTest/${id}`);
}

export { getCrudTest, postCrudTest, patchCrudTest, deleteCrudTest };
