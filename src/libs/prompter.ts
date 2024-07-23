import prompts from '@/prompt.json'

export function buildTranslatePrompt (article: string, dictionary: string): Array<{
  role: string,
  content: string
}> {
  return dictionary ? [
    {
      role: 'system',
      content: prompts.translatePromptSystem,
    },
    {
      role: 'user',
      content: prompts.translatePrompt + '\n\n以下是可能会用到的专用名词词典：\n' + dictionary + '\n\n需要翻译的文章：\n###\n' + article + '\n###\n\n你的翻译：\n',
    },
  ] : [
    {
      role: 'system',
      content: prompts.translatePromptSystem,
    },
    {
      role: 'user',
      content: prompts.translatePrompt + '\n\n需要翻译的文章：\n###\n' + article + '\n###\n\n你的翻译：\n',
    },
  ]
}

export function buildPolishPrompt (article: string): Array<{
  role: string,
  content: string
}> {
  return [
    {
      role: 'system',
      content: prompts.polishPromptSystem,
    },
    {
      role: 'user',
      content: prompts.polishPrompt + '\n\n需要优化的文章：\n###\n' + article + '\n###\n\n你的优化结果是：\n',
    },
  ]
}
