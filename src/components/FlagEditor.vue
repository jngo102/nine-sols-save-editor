<script setup lang="ts">
import { computed, ref } from 'vue';

import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

import { type FlagType } from '@/components/types';
import { onMounted } from 'vue';

interface FlagEditorProps {
  flagId: string;
  flagTitle: string;
  flagDescription: string;
  flagValue: FlagType;
}

onMounted((): void => {
  console.log('Flag type: ', typeof props.flagValue);
  switch (typeof props.flagValue) {
    case 'boolean':
      console.log('Bool value: ', props.flagValue as boolean);
      currentValueBoolean.value = props.flagValue as boolean;
      break;
    case 'number':
      currentValueNumber.value = props.flagValue as number;
      break;
    case 'string':
      currentValueString.value = props.flagValue as string;
      break;
    case 'object':
      currentValueObject.value = props.flagValue as Object;
      break;
  }
});

const emit = defineEmits(['value-changed']);
const props = defineProps<FlagEditorProps>();

const currentValueBoolean = ref<boolean>(false);
const currentValueNumber = ref<number>(0);
const currentValueString = ref<string>('');
const currentValueObject = ref<Record<string, any>>({});

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
</script>

<template>
  <div class="flag-editor">
    <div>
      <h4>Title: {{ props.flagTitle }}</h4>
      <p>Description: {{ props.flagDescription }}</p>
      <small>ID: {{ props.flagId }}</small>
    </div>
    <div>
      <Checkbox
        v-if="valueIsBoolean"
        :id="valueInputId"
        v-model="currentValueBoolean"
        @update:model-value="emit('value-changed', currentValueBoolean)"
      />
      <InputNumber
        v-else-if="valueIsNumber"
        v-model="currentValueNumber"
        :id="valueInputId"
        :min-fraction-digits="2"
        show-buttons
        @update:model-value="emit('value-changed', currentValueNumber)"
      />
      <div v-else-if="valueIsObject">
        <div v-for="[key, value] in Object.entries(currentValueObject)" :key="key">
          <span class="inline">
            <p>{{ key }}:</p>
            <Checkbox
              v-if="typeof value === 'boolean'"
              :v-model="currentValueObject[key as keyof Object]"
              class="flag-bool"
              @update:model-value="emit('value-changed', currentValueObject)"
            />
            <InputNumber
              v-else-if="typeof value === 'number'"
              :v-model="currentValueObject[key as keyof Object]"
              class="flag-number"
              mode="decimal"
              @update:model-value="emit('value-changed', currentValueObject)"
            />
            <InputText
              v-else-if="typeof value === 'string'"
              :v-model="currentValueObject[key as keyof Object]"
              class="flag-string"
              @update:model-value="emit('value-changed', currentValueObject)"
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
