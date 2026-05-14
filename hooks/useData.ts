import { useState, useEffect } from 'react'

export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/data/${path}`)
        if (!response.ok) throw new Error(`Failed to fetch ${path}`)
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [path])

  return { data, loading, error }
}
