<template>
  <main>
    <Card class="p-2 m-2">
      <template #header>
        <FileUpload id="upload-save-files-input" accept="text/plain" class="sticky" multiple
          :max-file-size="Math.pow(2, 23)" :show-cancel-button="false" :show-upload-button="false"
          @select="uploadSaveFiles">
          <template #empty>
            Upload or drag-and-drop your save file, named "flags.txt", and your save metadata file, named "meta.txt",
            here.
          </template>
          <template #content="{ files }">
            <div v-if="files.length <= 0">No files uploaded.</div>
            <div v-else-if="!files.some((file) => file.name === 'flags.txt')">
              <p>Please upload your flags.txt save file as well.</p>
            </div>
            <div v-else-if="!files.some((file) => file.name === 'meta.txt')">
              <p>Please upload your meta.txt metadata file as well.</p>
            </div>
            <div v-else-if="files.every((file) => file.name === 'flags.txt' || file.name === 'meta.txt')">
              <p>Files uploaded successfully!</p>
            </div>
          </template>
        </FileUpload>
      </template>
      <template #content>
        <div class="overflow-y-scroll max-h-30rem">
          <div v-if="saveMetadata">
            <b>Save Metadata:</b>
            <p>Last Teleport Point Path:
              <InputText id="metadata-last-tp-point-path-input" v-model="saveMetadata.lastTeleportPointPath" />
            </p>
            <p>Last Scene GUID:
              <InputText id="metadata-at-scene-guid-input" v-model="saveMetadata.atSceneGuid" />
            </p>
            <p>Last Position:
              <InputNumber id="metadata-last-pos-x-input" v-model="saveMetadata.lastPos.x" show-buttons />
              <InputNumber id="metadata-last-pos-y-input" v-model="saveMetadata.lastPos.y" show-buttons />
              <InputNumber id="metadata-last-pos-z-input" v-model="saveMetadata.lastPos.z" show-buttons />
            </p>
            <p>Gold:
              <InputNumber id="metadata-gold-input" v-model="saveMetadata.gold" show-buttons />
            </p>
            <p>Level:
              <InputNumber id="metadata-level-input" v-model="saveMetadata.level" show-buttons />
            </p>
            <p>Experience:
              <InputNumber id="metadata-exp-input" v-model="saveMetadata.exp" show-buttons />
            </p>
            <p>Skill Points Remaining:
              <InputNumber id="metadata-skill-point-left-input" v-model="saveMetadata.skillPointLeft" show-buttons />
            </p>
            <p>Total Skill Level:
              <InputNumber id="metadata-total-skill-level-input" v-model="saveMetadata.totalSkillLevel" show-buttons />
            </p>
            <p>Play Time:
              <InputNumber id="metadata-play-time-input" v-model="saveMetadata.playTime" :min-fraction-digits="0"
                :max-fraction-digits="8" show-buttons />
            </p>
            <p>Death Count:
              <InputNumber id="metadata-death-count-input" v-model="saveMetadata.deathCount" show-buttons />
            </p>
            <p>Finished Credit Roll:
              <Checkbox id="metadata-finished-credit-roll-input" v-model="saveMetadata.finishedCreditRoll" binary />
            </p>
            <p>Second Time Playing:
              <Checkbox id="metadata-second-time-play-input" v-model="saveMetadata.secondTimePlay" binary />
            </p>
            <p>True End Triggered:
              <Checkbox id="metadata-true-end-triggered-input" v-model="saveMetadata.trueEndTriggered" binary />
            </p>
            <p>Bad End Triggered:
              <Checkbox id="metadata-bad-end-triggered-input" v-model="saveMetadata.badEndTriggered" binary />
            </p>
            <p>Game Mode:
              <InputNumber id="metadata-game-mode-input" v-model="saveMetadata.gameMode" show-buttons />
            </p>
            <div v-if="flagFileContents.length > 0">
              <b>Save Flags: </b>
              <FlagEditor v-for="flag in flagDetailsList" :key="flag.id" :flag-id="flag.id" :flag-title="flag.title"
                :flag-description="flag.description" :flag-fields="flag.fields"
                @fields-changed="(newFields: Record<string, FlagFieldType>) => updateFlagFields(flag.id, newFields)" />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="sticky">
          <Button id="download-flags-button" icon="pi pi-download" label="Download Flags" class="p-button-success"
            @click="downloadFlags" />
          <Button id="download-metadata-button" icon="pi pi-download" label="Download Metadata" class="p-button-primary"
            @click="downloadMetadata" />
        </div>
      </template>
    </Card>
    <span>
      <a :href="packageJson.repository.url">
        <i class="pi pi-github"> Source Code </i>
      </a>
    </span>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CryptoJS from 'crypto-js';

import { type FileUploadSelectEvent } from 'primevue/fileupload';

import FlagEditor from '@/components/FlagEditor.vue';
import { type FlagFieldType, type SaveMetadata } from '@/components/types';

import packageJson from '../package.json';
import configJson from './assets/configs/config.json';

interface FlagDetails {
  id: string;
  title: string;
  description: string;
  fields: Record<string, FlagFieldType>;
}

const KEY = '1234567812345678';
const IV = '1234567812345678';

const flagFileContents = ref<string>('');
const saveMetadata = ref<SaveMetadata | null>(null);

const flagJsonString = computed((): string => {
  const saveJson = decrypt(flagFileContents.value);
  return saveJson;
});
const flagJson = computed((): object =>
  flagJsonString.value.length > 0 ? JSON.parse(flagJsonString.value) : {}
);
const flagDetailsList = ref<Array<FlagDetails>>([]);

const uploadSaveFiles = async (event: FileUploadSelectEvent): Promise<void> => {
  const files = event.files as Array<File>;
  const flagsFile = files.find((file => file.name === 'flags.txt'));
  const metaFile = files.find((file => file.name === 'meta.txt'));
  if (files.length <= 0 || !flagsFile || !metaFile) return;

  const metaReader = new FileReader();
  metaReader.onload = (event: ProgressEvent<FileReader>) => {
    const metaContents = event.target?.result as string;
    const metaDecrypted = decrypt(metaContents);
    saveMetadata.value = JSON.parse(metaDecrypted) as SaveMetadata;
  };
  metaReader.readAsText(metaFile);

  const flagsReader = new FileReader();
  flagsReader.onload = (event: ProgressEvent<FileReader>) => {
    flagFileContents.value = event.target?.result as string;
    if (flagJsonString.value.length < 0) return;
    flagDetailsList.value = [];
    configJson.forEach((flag) => {
      const flagRecord = flagJson.value[flag.id as keyof object];
      if (flagRecord) {
        flagDetailsList.value.push({
          id: flag.id,
          title: flag.title,
          description: flag.description,
          fields: flagRecord,
        });
      }
    });
  };
  flagsReader.readAsText(flagsFile);
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

const updateFlagFields = (flagId: string, newFields: Record<string, FlagFieldType>): void => {
  let flag = flagDetailsList.value.find((f) => f.id === flagId);
  if (flag) {
    const flagIndex = flagDetailsList.value.indexOf(flag);
    flagDetailsList.value[flagIndex].fields = newFields;
  }
};

const downloadFlags = (): void => {
  if (flagDetailsList.value.length <= 0) return;
  const flagJson: { [key: string]: Record<string, FlagFieldType> } = {};
  flagDetailsList.value.forEach((flag) => {
    flagJson[flag.id] = flag.fields;
  });
  const flagJsonString = JSON.stringify(flagJson);
  const encrypted = encrypt(flagJsonString);
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flags.txt';
  a.click();
  URL.revokeObjectURL(url);
};

const downloadMetadata = (): void => {
  if (!saveMetadata.value) return;
  const metaJson = JSON.stringify(saveMetadata.value);
  const encrypted = encrypt(metaJson);
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meta.txt';
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
