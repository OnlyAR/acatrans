export function buildTranslatePrompt (article: string, translateTemplate: string, dictionary: string): Array<{
  role: string,
  content: string
}> {
  return dictionary ? [
    {
      role: 'system',
      content: translateTemplate + '\n\n以下是专有名词的翻译列表\n\n' + dictionary,
    },
    {
      role: 'user',
      content: article,
    },
  ] : [
    {
      role: 'system',
      content: translateTemplate,
    },
    {
      role: 'user',
      content: article,
    },
  ]
}

export function buildPolishPrompt (article: string, polishTemplate: string): Array<{
  role: string,
  content: string
}> {
  return [
    {
      role: 'system',
      content: polishTemplate,
    },
    {
      role: 'user',
      content: article,
    },
  ]
}
