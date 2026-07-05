class OpenAIMock {
  constructor(options) {
    globalThis.__openAiConstructorOptions = options
    this.chat = {
      completions: {
        create: async (request) => {
          globalThis.__deepseekRequest = request
          if (globalThis.__deepseekCreateError) {
            throw globalThis.__deepseekCreateError
          }
          return globalThis.__deepseekCompletion
        },
      },
    }
  }
}

module.exports = OpenAIMock
module.exports.default = OpenAIMock
