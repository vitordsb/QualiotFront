<template>
  <div class="tags-editor">
    <div class="tags-list">
      <span v-for="(tag, index) in localTags" :key="index" class="tag-badge">
        <span v-if="editIndex !== index" @click="startEditing(index)">
          {{ tag }}
        </span>
        <input v-else v-model="editedTag" @keyup.enter="saveEdit(index)" @blur="saveEdit(index)" class="edit-input" />
        <button class="remove-tag" @click="removeTag(index)">X</button>
      </span>
    </div>
    <div class="add-tag">
      <input type="text" v-model="newTag" @keyup.enter="addTag" placeholder="Adicionar tag"/>
      <button class="add-tag-button" @click="addTag">Adicionar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["update:modelValue"]);

const localTags = ref([...props.modelValue]);

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localTags.value)) {
    localTags.value = [...newVal];
  }
});
watch(localTags, (newVal) => {
  emit("update:modelValue", newVal);
}, { deep: true });

const newTag = ref("");
const editIndex = ref(null);
const editedTag = ref("");

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !localTags.value.includes(tag)) {
    localTags.value.push(tag);
    newTag.value = "";
  }
};

const removeTag = (index) => {
  localTags.value.splice(index, 1);
};

const startEditing = (index) => {
  editIndex.value = index;
  editedTag.value = localTags.value[index];
};

const saveEdit = (index) => {
  if (editedTag.value.trim()) {
    localTags.value[index] = editedTag.value.trim();
  }
  editIndex.value = null;
};
</script>

<style scoped>
.tags-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tags-list {
    margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-badge {
  background-color: #ffe51e;
  padding: 10px;
  font-weight: bold;
  color: white;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1em;
}
.remove-tag {
    font-size: 1rem;
  color: red;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.add-tag {
  display: flex;
  gap: 8px;
  align-items: center;
}
.add-tag input {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
.edit-input {
  width: auto;
  padding: 20px;
}
.add-tag-button {
  padding: 10px 20px;
  background-color: #3389CE;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
