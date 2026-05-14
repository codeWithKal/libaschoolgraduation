'use client'

import Link from 'next/link'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-netflix-black border-t border-netflix-gray/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* School Info */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-white mb-4">
              Liba
            </h3>
            <p className="text-netflix-lightgray text-sm leading-relaxed">
              Celebrating the remarkable achievements of the NOVAREING batch of 2026
            </p>
            <div className="flex items-center gap-2 text-netflix-red mt-4">
              <Heart size={16} />
              <span className="text-xs">United in Excellence</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-modern)' }} className="text-lg font-bold text-white mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-netflix-lightgray hover:text-netflix-red transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/students" className="text-netflix-lightgray hover:text-netflix-red transition text-sm">
                  Browse Students
                </Link>
              </li>
              <li>
                <Link href="/memories" className="text-netflix-lightgray hover:text-netflix-red transition text-sm">
                  Shared Memories
                </Link>
              </li>
              <li>
                <Link href="/guestbook" className="text-netflix-lightgray hover:text-netflix-red transition text-sm">
                  Guestbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-modern)' }} className="text-lg font-bold text-white mb-6">
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-netflix-red flex-shrink-0 mt-1" />
                <span className="text-netflix-lightgray text-sm">graduation@liba.edu</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-netflix-red flex-shrink-0 mt-1" />
                <span className="text-netflix-lightgray text-sm">+251 911 234 567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-netflix-red flex-shrink-0 mt-1" />
                <span className="text-netflix-lightgray text-sm">Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>

          {/* Event Details */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-modern)' }} className="text-lg font-bold text-white mb-6">
              Graduation Day
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-netflix-red text-sm font-semibold">Date</p>
                <p className="text-netflix-lightgray text-sm">July 25, 2026</p>
              </div>
              <div>
                <p className="text-netflix-red text-sm font-semibold">Time</p>
                <p className="text-netflix-lightgray text-sm">6:00 PM</p>
              </div>
              <div>
                <p className="text-netflix-red text-sm font-semibold">Venue</p>
                <p className="text-netflix-lightgray text-sm">Central Convention Center</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-netflix-gray/30 pt-8 mt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-netflix-lightgray text-xs">
                © {currentYear} Liba School - NOVAREING Batch. All rights reserved.
              </p>
              <p className="text-netflix-gray text-xs mt-1">
                Celebrating Excellence • Building Futures • Creating Memories
              </p>
            </div>

            {/* Social/Additional Links */}
            <div className="flex gap-6 text-xs">
              <button className="text-netflix-lightgray hover:text-netflix-red transition">
                Privacy Policy
              </button>
              <button className="text-netflix-lightgray hover:text-netflix-red transition">
                Terms of Service
              </button>
              <button className="text-netflix-lightgray hover:text-netflix-red transition">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Graduation Message */}
        <div className="mt-8 pt-8 border-t border-netflix-gray/30 text-center">
          <p style={{ fontFamily: 'var(--font-elegant)' }} className="text-netflix-red text-sm italic">
            "The best time to plant a tree was 20 years ago. The second best time is now." - Class of 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
