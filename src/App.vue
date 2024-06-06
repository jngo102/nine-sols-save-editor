<template>
  <main>
    <div class="p-2">
      <div class="sticky">
        <h3>Upload Save File</h3>
        <FileUpload
          id="upload-save-file-input  "
          accept="text/plain"
          :max-file-size="Math.pow(2, 23)"
          :show-cancel-button="false"
          :show-upload-button="false"
          @select="uploadSaveFile"
        >
          <template #empty>
            Upload or drag-and-drop your save file, named "flags.txt" here.
          </template>
          <template #content="{ files }">
            <div v-if="files.length > 0">
              <p>Save file uploaded.</p>
            </div>
          </template>
        </FileUpload>
      </div>
      <div v-for="flag in flagDetailsList" :key="flag.id">
        <FlagEditor
          :flag-id="flag.id"
          :flag-title="flag.title"
          :flag-value="flag.value"
          :flag-description="flag.description"
          @value-changed="(newValue: FlagType) => updateFlagValue(flag.id, newValue)"
        />
        <br />
      </div>
      <Button
        label="Download Save"
        icon="pi pi-download"
        class="p-button-success"
        @click="downloadSave"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CryptoJS from 'crypto-js';

import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';

import FlagEditor from '@/components/FlagEditor.vue';
import { type FlagType } from '@/components/types';

import configJson from './assets/configs/config.json';

interface FlagDetails {
  id: string;
  title: string;
  description: string;
  value: FlagType;
}

const KEY = '1234567812345678';
const IV = '1234567812345678';

const saveFileContents = ref<string>('');

const saveJsonString = computed((): string => {
  const saveJson = decrypt(saveFileContents.value);
  return saveJson;
});
const saveJson = computed((): object =>
  saveJsonString.value.length > 0 ? JSON.parse(saveJsonString.value) : {}
);
const flagDetailsList = ref<Array<FlagDetails>>([]);

const uploadSaveFile = (event: FileUploadSelectEvent): void => {
  const files = event.files as Array<File>;
  const file = files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    saveFileContents.value = event.target?.result as string;
    if (saveJsonString.value.length < 0) return [];
    flagDetailsList.value = configJson.map((flag) => {
      const flagValue = saveJson.value[flag.id as keyof Object];
      return {
        id: flag.id,
        title: flag.title,
        description: flag.description,
        value: flagValue ? flagValue['field' as keyof Object] ?? flagValue : ''
      };
    });
  };
  reader.readAsText(file);
};

const decrypt = (text: string): string => {
  const key = CryptoJS.enc.Utf8.parse(KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const textBase64 = CryptoJS.enc.Base64.parse(text);
  const decryptor = CryptoJS.algo.AES.createDecryptor(key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return decryptor.finalize(textBase64).toString(CryptoJS.enc.Utf8);
};

const updateFlagValue = (flagId: string, newValue: FlagType): void => {
  let flag = flagDetailsList.value.find((f) => f.id === flagId);
  if (flag) {
    const flagIndex = flagDetailsList.value.indexOf(flag);
    if (typeof flag.value === 'object' && flag.value['field' as keyof Object]) {
      flagDetailsList.value[flagIndex].value = { field: newValue };
    } else {
      flagDetailsList.value[flagIndex].value = newValue;
    }
  }
};

const downloadSave = (): void => {
  const flagJson: { [key: string]: FlagType } = {};
  flagDetailsList.value.forEach((flag) => {
    flagJson[flag.id] = flag.value;
  });
  const flagJsonString = JSON.stringify(flagJson);
  const encryptedSave = encrypt(flagJsonString);
  const blob = new Blob([encryptedSave], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flags.txt';
  a.click();
  URL.revokeObjectURL(url);
};

const encrypt = (json: string): string => {
  const key = CryptoJS.enc.Utf8.parse(KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const text = CryptoJS.enc.Utf8.parse(json);
  const encryptor = CryptoJS.algo.AES.createEncryptor(key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return encryptor.finalize(text).toString(CryptoJS.enc.Base64);
};
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
