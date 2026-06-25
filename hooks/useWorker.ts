'use client'
import { useRef, useCallback, useEffect } from 'react'

type WorkerMessage = { type: string; payload: any }
type WorkerResult<T> = Promise<T>

let _idCounter = 0

export function useWorker<T = any>(workerPath: string) {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<number, { resolve: (v: T) => void; reject: (e: Error) => void }>>(new Map())

  useEffect(() => {
    if (typeof window === 'undefined') return
    workerRef.current = new Worker(workerPath)
    workerRef.current.onmessage = (e) => {
      const { id, result, error } = e.data
      const pending = pendingRef.current.get(id)
      if (!pending) return
      pendingRef.current.delete(id)
      if (error) pending.reject(new Error(error))
      else pending.resolve(result)
    }
    return () => { workerRef.current?.terminate() }
  }, [workerPath])

  const send = useCallback((msg: WorkerMessage): WorkerResult<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback: run synchronously if Worker not available (SSR guard)
        reject(new Error('Worker not initialized'))
        return
      }
      const id = ++_idCounter
      pendingRef.current.set(id, { resolve, reject })
      workerRef.current.postMessage({ ...msg, id })
    })
  }, [])

  return { send }
}
