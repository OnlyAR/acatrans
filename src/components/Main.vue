<script setup lang="ts">
  import { callModel } from '@/libs/request'
  import { ref } from 'vue'
  import data from '@/prompt.json'
  import { buildPolishPrompt, buildTranslatePrompt } from '@/libs/prompter'

  const translateTemplate = ref(data.translatePrompt)
  const polishTemplate = ref(data.polishPrompt)
  const dictionary = ref('')
  const enArticle = ref('Many studies show a power-law relationship between performance and the increases in both the number of parameters and the size of the training data, which are crucial for large language models (LLMs) and provide a predictive structure for determining the most efficient setups for expanded models using the insights gained from smaller models Moreover, the extension of scaling laws to autoregressive generative models widens their relevance to encompass tasks beyond text.')
  const zhArticle = ref('')
  const resultText = ref('这是示例输出')

  const resultLoading = ref(false)

  const decoder = new TextDecoder('utf-8')

  const submitLocks = ref({
    article: false,
    dictionary: false,
    translate: false,
    polish: false,
  })

  function allowSubmit () {
    return !Object.values(submitLocks.value).includes(true)
  }

  function copyToClipboard () {
    const text = resultText.value
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard')
    })
  }

  function countWord (text: string, en: boolean) {
    if (en) {
      return text.split(/\s+/).length
    } else {
      return text.length
    }
  }

  function limitAllow (text: string, box: string) {
    let limit
    let en
    switch (box) {
      case 'article':
        limit = 2000
        en = true
        break
      case 'dictionary':
        limit = 100
        en = true
        break
      case 'translate':
        limit = 100
        en = false
        break
      case 'polish':
        limit = 100
        en = false
        break
      default:
        throw new Error('Invalid box type')
    }
    if (countWord(text, en) > limit) {
      submitLocks.value[box] = true
      return `输入内容请不要超过${limit}${en ? '词' : '字'}`
    } else {
      submitLocks.value[box] = false
      return true
    }
  }

  async function translate () {
    const messageList = buildTranslatePrompt(enArticle.value, translateTemplate.value, dictionary.value)
    const {
      body,
      status,
    } = await callModel(messageList, false)
    if (status === 200 && body) {
      const {
        value,
        done,
      } = await body.getReader().read()
      const decodedText = decoder.decode(value)
      const result = JSON.parse(decodedText)
      zhArticle.value = result.choices[0].message.content
    }
  }

  async function polish () {
    const messageList = buildPolishPrompt(zhArticle.value, polishTemplate.value)
    const {
      body,
      status,
    } = await callModel(messageList, true)
    if (status === 200 && body) {
      const reader = body.getReader()
      while (true) {
        const {
          value,
          done,
        } = await reader.read()
        if (done) break
        const decodedText = decoder.decode(value, { stream: true })
        console.log('[DEBUG]: ' + decodedText)
        const textList = decodedText.split('data: ')
        for (let i = 1; i < textList.length; i++) {
          if (textList[i].substring(0, 6) === '[DONE]') break
          const result = JSON.parse(textList[i])
          const token = result.choices[0].delta.content
          resultText.value += token
        }
      }
    }
  }

  async function submit () {
    resultText.value = ''
    resultLoading.value = true
    await translate()
    resultLoading.value = false
    await polish()
  }

</script>

<template>
  <v-main id="outer">
    <div class="container-v-center">
      <v-avatar image="@/assets/assistant.svg" size="50" style="margin: auto 0" />
      <span class="assistant">AcaTrans</span>
    </div>
    <v-card :loading="resultLoading">
      <template #loader="{ isActive }">
        <v-progress-linear
          :active="isActive"
          color="deep-purple"
          height="4"
          indeterminate
        />
      </template>
      <v-card-text style="font-size: 16px">
        {{ resultText }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <span class="text-disabled">以上内容为AI生成，仅供参考和借鉴</span>
        <v-btn icon="mdi-content-copy" @click="copyToClipboard" />
      </v-card-actions>
    </v-card>

    <div class="section-box" />

    <v-textarea
      v-model="enArticle"
      auto-grow
      bg-color="#fefefe"
      counter
      placeholder="请输入待翻译的文本"
      :rules="[v => limitAllow(v, 'article')]"
      variant="solo"
    />

    <div class="container-h-center">
      <v-btn
        :disabled="!allowSubmit()"
        :ripple="true"
        size="large"
        @click="submit"
      >GO!</v-btn>
    </div>

    <v-expansion-panels class="section-box">
      <v-expansion-panel>
        <v-expansion-panel-title class="section-header prompt-title">
          专用词典
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-textarea
            v-model="dictionary"
            auto-grow
            bg-color="#fefefe"
            counter
            rows="1"
            :rules="[v => limitAllow(v, 'dictionary')]"
            variant="solo"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-expansion-panels class="section-box">
      <v-expansion-panel>
        <v-expansion-panel-title class="section-header prompt-title">
          翻译提示词
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-textarea
            v-model="translateTemplate"
            auto-grow
            bg-color="#fefefe"
            counter
            rows="1"
            :rules="[v => limitAllow(v, 'translate')]"
            variant="solo"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-expansion-panels class="section-box">
      <v-expansion-panel>
        <v-expansion-panel-title class="section-header prompt-title">
          润色提示词
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-textarea
            v-model="polishTemplate"
            auto-grow
            bg-color="#fefefe"
            class="prompt-content"
            counter
            rows="1"
            :rules="[limitAllow(polishTemplate, 'polish')]"
            variant="solo"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-main>
</template>

<style scoped>
#outer {
  width: 50%;
  min-width: 200px;
  margin: 30px auto;
}

.section-box {
  padding-top: 20px;
  padding-bottom: 20px;
}

.assistant {
  margin: auto 10px;
  align-self: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
}

.section-header {
  font-size: 1.3rem;
  color: #333;
}

.container-h-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
}

.container-v-center {
  display: flex;
  height: 70px;
}
</style>
