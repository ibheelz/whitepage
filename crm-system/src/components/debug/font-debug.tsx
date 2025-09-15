'use client'

import { useEffect, useState } from 'react'

export function FontDebug() {
  const [fontLoaded, setFontLoaded] = useState(false)
  const [availableFonts, setAvailableFonts] = useState<string[]>([])

  useEffect(() => {
    // Check if Next.js Oxanium font is loaded
    const checkFont = async () => {
      try {
        // Check for Next.js generated font class
        const oxaniumFonts = Array.from(document.fonts).filter(font =>
          font.family.includes('Oxanium') || font.family.includes('__Oxanium')
        )

        if (oxaniumFonts.length > 0) {
          setFontLoaded(true)
          console.log('✅ Next.js Oxanium font loaded successfully', oxaniumFonts)
        } else {
          setFontLoaded(false)
          console.log('❌ No Oxanium fonts found')
        }
      } catch (error) {
        console.error('❌ Failed to check Oxanium font:', error)
        setFontLoaded(false)
      }
    }

    // Get available fonts
    const fonts = Array.from(document.fonts).map(font => font.family)
    setAvailableFonts([...new Set(fonts)])
    console.log('Available fonts:', fonts)

    // Check font loading
    checkFont()

    // Log computed styles
    const body = document.body
    const computedStyle = window.getComputedStyle(body)
    console.log('Body font-family:', computedStyle.fontFamily)

    // Test if CSS font rules are working
    const testElement = document.createElement('div')
    testElement.style.fontFamily = 'Oxanium'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.innerHTML = 'Font Test'
    document.body.appendChild(testElement)

    const testStyle = window.getComputedStyle(testElement)
    console.log('Test element font-family:', testStyle.fontFamily)

    document.body.removeChild(testElement)
  }, [])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed top-0 right-0 z-50 bg-red-500 text-white p-2 text-xs max-w-xs">
      <div>Font Status: {fontLoaded ? '✅ Loaded' : '❌ Failed'}</div>
      <div>Available: {availableFonts.length} fonts</div>
      <div style={{ fontFamily: 'inherit' }}>Inherited Font (should be Oxanium)</div>
      <div style={{ fontFamily: '__Oxanium_64c3a5' }}>Next.js Oxanium Test</div>
      <div style={{ fontFamily: 'serif' }}>Serif Test Text</div>
    </div>
  )
}