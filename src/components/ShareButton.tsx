'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Check, Copy } from 'lucide-react'

interface ShareButtonProps {
  url: string
  title: string
  description: string
}

export default function ShareButton({ url, title, description }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://mikilele-customer.vercel.app${url}`
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl })
        return
      } catch (error) {
        console.log('Share cancelled')
      }
    }
    setShowMenu(!showMenu)
  }

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share Event
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Share this event</p>
            </div>
            <div className="p-2">
              <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                <span className="text-sm font-medium text-gray-900">{copied ? 'Link copied!' : 'Copy link'}</span>
              </button>
              <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                <span className="text-sm font-medium text-gray-900">Share on Twitter</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="text-sm font-medium text-gray-900">Share on Facebook</span>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                <span className="text-sm font-medium text-gray-900">Share on LinkedIn</span>
              </a>
              <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className="text-sm font-medium text-gray-900">Share on WhatsApp</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}