import { createWriteStream, mkdirSync } from 'node:fs'
import process from 'node:process'
import { finished } from 'node:stream/promises'

const runId = `${new Date().toISOString().replaceAll(':', '-')}-${process.pid}`
const logDirectory = 'logs'
const stdoutPath = `${logDirectory}/dev-${runId}.stdout.log`
const stderrPath = `${logDirectory}/dev-${runId}.stderr.log`

mkdirSync(logDirectory, { recursive: true })

console.log(`Nuxt stdout: ${stdoutPath}`)
console.log(`Nuxt stderr: ${stderrPath}`)

const child = Bun.spawn(['bun', 'run', 'dev'], {
  stdout: 'pipe',
  stderr: 'pipe',
})

async function capture(
  source: ReadableStream<Uint8Array>,
  terminal: NodeJS.WriteStream,
  path: string,
) {
  const log = createWriteStream(path, { flags: 'wx' })

  for await (const chunk of source) {
    terminal.write(chunk)
    log.write(chunk)
  }

  log.end()
  await finished(log)
}

function forwardSignal(signal: NodeJS.Signals) {
  child.kill(signal)
}

const stopOnInterrupt = () => forwardSignal('SIGINT')
const stopOnTermination = () => forwardSignal('SIGTERM')

process.on('SIGINT', stopOnInterrupt)
process.on('SIGTERM', stopOnTermination)

const [, , exitCode] = await Promise.all([
  capture(child.stdout, process.stdout, stdoutPath),
  capture(child.stderr, process.stderr, stderrPath),
  child.exited,
])

process.off('SIGINT', stopOnInterrupt)
process.off('SIGTERM', stopOnTermination)
process.exitCode = exitCode
