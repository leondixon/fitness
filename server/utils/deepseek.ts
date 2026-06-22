import OpenAI from 'openai'

export function getDeepSeekClient() {
  const config = useRuntimeConfig()
  const apiKey = config.deepseekApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing DEEPSEEK_API_KEY environment variable.',
    })
  }

  return new OpenAI({
    apiKey,
    baseURL: config.deepseekBaseUrl || 'https://api.deepseek.com',
  })
}
