<script setup lang="ts">
  import { buildPolishPrompt, buildTranslatePrompt } from '@/libs/prompter'
  import { callModel } from '@/libs/request'
  import MarkdownIt from 'markdown-it'
  import { ref } from 'vue'

  const dictionary = ref('')
  const enArticle = ref('')
  const zhArticle = ref('')
  const resultText = ref('')

  const resultLoading = ref(false)
  const markdown = new MarkdownIt()

  const decoder = new TextDecoder('utf-8')

  const submitLocks = ref({
    article: false,
    dictionary: false,
    translate: false,
    polish: false,
  })

  function renderMarkdown (input: string) {
    console.log(markdown.render(input))
    return markdown.render(input)
  }

  function allowSubmit () {
    return !Object.values(submitLocks.value).includes(true)
  }

  function copyToClipboard () {
    const text = resultText.value
    navigator.clipboard.writeText(text)
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
    const messageList = buildTranslatePrompt(enArticle.value, dictionary.value)
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
      console.log(done)
    }
  }

  async function polish () {
    const messageList = buildPolishPrompt(zhArticle.value)
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

      <div id="markdown" v-html="renderMarkdown(resultText)" />

      <v-card-actions>
        <v-spacer />
        <span class="text-disabled">以上内容为AI生成，仅供参考和借鉴</span>
        <v-btn icon="mdi-content-copy" @click="copyToClipboard" />
      </v-card-actions>
    </v-card>

    <div class="blank" />

    <v-textarea
      v-model="enArticle"
      auto-grow
      bg-color="#fefefe"
      counter
      placeholder="请输入待翻译的文本"
      :rules="[v => limitAllow(v, 'article')]"
      variant="outlined"
    />

    <div class="container-h-center">
      <v-btn
        :disabled="!allowSubmit()"
        elevation="8"
        :ripple="true"
        rounded="xl"
        size="x-large"
        style="font-size: 20px;"
        @click="submit"
      >GO!
      </v-btn>
    </div>

    <div class="blank" />

    <v-expansion-panels>
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
            variant="outlined"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-main>
</template>

<style scoped>
#outer {
  width: 50%;
  min-width: 380px;
  margin: 30px auto;
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
  height: 50px;
}

.container-v-center {
  display: flex;
  height: 70px;
}

.blank {
  height: 20px;
}

#markdown {
  font-size: 18px;
  line-height: 1.6em;
  margin: 20px 40px;
}
</style>
