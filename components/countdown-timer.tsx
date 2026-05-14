'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ eventDate }: { eventDate: Date }) {
  const [time, setTime] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const eventTime = eventDate.getTime()
      const distance = eventTime - now

      if (distance > 0) {
        setTime({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / 1000 / 60) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        })
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [eventDate])

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gold text-black rounded-lg px-6 py-4 min-w-20 text-center">
        <div className="text-4xl font-bold font-serif">{String(value).padStart(2, '0')}</div>
      </div>
      <div className="text-gold text-sm font-semibold mt-2 uppercase tracking-wider">{label}</div>
    </motion.div>
  )

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-6">
      <TimeUnit value={time.days} label="Days" />
      <div className="text-gold text-3xl font-bold mb-6">:</div>
      <TimeUnit value={time.hours} label="Hours" />
      <div className="text-gold text-3xl font-bold mb-6">:</div>
      <TimeUnit value={time.minutes} label="Minutes" />
      <div className="text-gold text-3xl font-bold mb-6">:</div>
      <TimeUnit value={time.seconds} label="Seconds" />
    </div>
  )
}
