import key from '@/api-key.json'

const MODEL = 'glm-3-turbo'
const API_URL = `https://open.bigmodel.cn/api/paas/v4/chat/completions`
const API_KEY = key.API_KEY

export async function callModel (messageList: Array<{
  role: string,
  content: string
}>, isStream: boolean): Promise<Response> {
  try {
    return await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messageList,
        stream: isStream,
      }),
    })
  } catch (error) {
    throw error
  }
}
