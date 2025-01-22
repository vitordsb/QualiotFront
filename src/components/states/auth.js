import { reactive } from 'vue';

export const auth = reactive({
  userName: localStorage.getItem('name') || ''
});

export function setUser(name) {
  auth.userName = name;
  localStorage.setItem('name', name);
}

export function clearUser() {
  auth.userName = '';
  localStorage.removeItem('name');
}


