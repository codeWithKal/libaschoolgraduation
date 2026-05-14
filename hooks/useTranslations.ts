'use client'

import { useState, useEffect } from 'react'

type Language = 'en' | 'am'

export function useTranslations(language: Language) {
  const [translations, setTranslations] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }

    loadTranslations()
  }, [language])

  return translations
}
