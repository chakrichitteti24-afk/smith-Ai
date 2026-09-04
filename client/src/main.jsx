import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import './index.css'
import App from './App.jsx'

/**
 * Monaco Editor emits "ERR Canceled: Canceled" from its internal platform-level
 * touch/cancellation handlers. These are completely benign — they fire when
 * Monaco cancels a pending async operation (hover, autocomplete, tokenization)
 * because the user touched elsewhere or switched views. We suppress them at
 * three levels:
 *
 * 1. loader.init() → setUnexpectedErrorHandler (earliest, before any mount)
 * 2. console.error interception (catches Monaco's internal error() calls)
 * 3. window unhandledrejection (catches stray rejected cancellation promises)
 */

function isCanceledError(val) {
  if (!val) return false
  if (typeof val === 'string') return val.includes('Canceled')
  if (val instanceof Error) return val.message === 'Canceled' || val.name === 'Canceled'
  if (typeof val === 'object' && val.message) return val.message === 'Canceled'
  return false
}

// 1. Intercept Monaco at loader level — runs before any Editor component mounts
loader.init().then((monaco) => {
  if (monaco?.editor?.setUnexpectedErrorHandler) {
    monaco.editor.setUnexpectedErrorHandler((err) => {
      if (isCanceledError(err)) return
      console.warn('[Monaco unexpected error]', err)
    })
  }
}).catch(() => {
  // loader.init() can itself throw cancelation on HMR — ignore
})

// 2. Intercept console.error — Monaco's bundled error() function calls this
if (typeof window !== 'undefined') {
  const _origError = console.error
  console.error = function (...args) {
    for (const arg of args) {
      if (isCanceledError(arg)) return
      if (typeof arg === 'string' && (
        arg.includes('ERR Canceled') ||
        arg.includes('Canceled: Canceled') ||
        arg.includes("Cannot read properties of undefined (reading 'startTime')")
      )) return
    }
    _origError.apply(console, args)
  }

  // 3. Catch unhandled promise rejections from Monaco cancellation tokens
  window.addEventListener('unhandledrejection', (event) => {
    if (isCanceledError(event.reason)) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
