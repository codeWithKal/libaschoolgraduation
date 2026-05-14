'use client'

import { useState, useEffect } from 'react'

type Language = 'en' | 'am'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('language') as Language | null
    if (saved) setLanguage(saved)
  }, [])

  const switchLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return { language, switchLanguage }
}
