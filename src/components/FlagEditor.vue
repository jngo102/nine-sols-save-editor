<script setup lang="ts">
import { computed, ref } from 'vue';

import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

import { type FlagType, type ObjectFlagFieldType } from '@/components/types';
import { onMounted } from 'vue';

interface FlagEditorProps {
  flagId: string;
  flagTitle: string;
  flagDescription: string;
  flagValue: FlagType;
}

onMounted((): void => {
  switch (typeof props.flagValue) {
    case 'boolean':
      currentValueBoolean.value = props.flagValue as boolean;
      break;
    case 'number':
      currentValueNumber.value = props.flagValue as number;
      break;
    case 'string':
      currentValueString.value = props.flagValue as string;
      break;
    case 'object':
      currentValueObject.value = {};
      Object.entries(props.flagValue).forEach(([key, value]) => {
        currentValueObject.value[key] = value as ObjectFlagFieldType;
      });
      break;
  }
});

const emit = defineEmits(['value-changed']);
const props = defineProps<FlagEditorProps>();

const currentValueBoolean = ref<boolean>(false);
const currentValueNumber = ref<number>(0);
const currentValueString = ref<string>('');
const currentValueObject = ref<Record<string, ObjectFlagFieldType>>({});

const valueIsBoolean = computed((): boolean => {
  return typeof props.flagValue === 'boolean';
});

const valueIsObject = computed((): boolean => {
  return typeof props.flagValue === 'object';
});

const valueIsNumber = computed((): boolean => {
  return typeof props.flagValue === 'number';
});

const valueIsText = computed((): boolean => {
  return typeof props.flagValue === 'string';
});

const valueInputId = computed((): string => {
  return `flag-value-${props.flagId}`;
});

const updateValueObject = (key: string, newValue: ObjectFlagFieldType): void => {
  if (currentValueObject.value[key]) {
    currentValueObject.value[key] = newValue;
    emit('value-changed', currentValueObject.value as object);
  }
};
</script>

<template>
  <div class="flag-editor">
    <div>
      <p>
        Title: <b>{{ props.flagTitle }}</b>
      </p>
      <p v-if="props.flagDescription.length > 0">Description: {{ props.flagDescription }}</p>
      <small>ID: {{ props.flagId }}</small>
    </div>
    <div>
      <Checkbox
        v-if="valueIsBoolean"
        :id="valueInputId"
        binary
        v-model="currentValueBoolean"
        @update:model-value="emit('value-changed', currentValueBoolean)"
      />
      <InputNumber
        v-else-if="valueIsNumber"
        v-model="currentValueNumber"
        :id="valueInputId"
        :min-fraction-digits="0"
        :max-fraction-digits="8"
        show-buttons
        @update:model-value="emit('value-changed', currentValueNumber)"
      />
      <div v-else-if="valueIsObject">
        <div v-for="[key, value] in Object.entries(currentValueObject)" :key="key">
          <span class="inline">
            {{ key }}:
            <Checkbox
              v-if="typeof value === 'boolean'"
              v-model="currentValueObject[key]"
              binary
              class="flag-field-bool"
              @update:model-value="(value: boolean) => updateValueObject(key, value)"
            />
            <InputNumber
              v-else-if="typeof value === 'number'"
              v-model="currentValueObject[key]"
              class="flag-field-number"
              :min-fraction-digits="0"
              :max-fraction-digits="8"
              show-buttons
              @update:model-value="(value: number) => updateValueObject(key, value)"
            />
            <InputText
              v-else-if="typeof value === 'string'"
              v-model="currentValueObject[key]"
              class="flag-field-string"
              @update:model-value="(value?: string) => updateValueObject(key, value ?? '')"
            />
          </span>
        </div>
      </div>
      <InputText
        v-else-if="valueIsText"
        :id="valueInputId"
        v-model="currentValueString"
        @update:model-value="emit('value-changed', currentValueString)"
      />
    </div>
  </div>
</template>
