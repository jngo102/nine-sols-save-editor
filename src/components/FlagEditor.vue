<script setup lang="ts">
import { computed, ref } from 'vue';

import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

import { type FlagFieldType } from '@/components/types';

interface FlagEditorProps {
    flagId: string;
    flagTitle: string;
    flagDescription: string;
    flagFields: Record<string, FlagFieldType>;
}

const emit = defineEmits(['fields-changed']);
const props = defineProps<FlagEditorProps>();
    
const fieldRecord = ref<Record<string, FlagFieldType>>(props.flagFields);

const flagEditorId = computed((): string => {
    return `flag-editor-${props.flagId}`;
});

const updateValueObject = (key: string, newValue: FlagFieldType): void => {
    if (fieldRecord.value[key]) {
        fieldRecord.value[key] = newValue;
        emit('fields-changed', fieldRecord.value);
    }
};
</script>

<template>
    <div :id="flagEditorId" class="flag-editor">
        <div>
            <p>
                Title: <b>{{ props.flagTitle }}</b>
            </p>
            <p v-if="props.flagDescription.length > 0">Description: {{ props.flagDescription }}</p>
            <small>ID: {{ props.flagId }}</small>
        </div>
        <div>
            <div v-for="[key, value] in Object.entries(fieldRecord)" :key="key">
                <span class="inline">
                    {{ key }}:
                    <Checkbox v-if="typeof value === 'boolean'" v-model="fieldRecord[key]" binary
                        class="flag-field-bool"
                        @update:model-value="(value: boolean) => updateValueObject(key, value)" />
                    <InputNumber v-else-if="typeof value === 'number'" v-model="fieldRecord[key]"
                        class="flag-field-number" show-buttons
                        @update:model-value="(value: number) => updateValueObject(key, value)" />
                    <InputText v-else-if="typeof value === 'string'" v-model="fieldRecord[key]"
                        class="flag-field-string"
                        @update:model-value="(value?: string) => updateValueObject(key, value ?? '')" />
                </span>
            </div>
        </div>
    </div>
</template>
