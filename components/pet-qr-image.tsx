import React from 'react'
import Image from 'next/image'

interface PetQRImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
  className?: string
}

/**
 * Component to display QR code or regular image from base64 or URL
 * Supports data:image URIs (base64) or regular image URLs
 */
export default function PetQRImage({
  src,
  alt = 'QR Code',
  width = 200,
  height = 200,
  className = ''
}: PetQRImageProps) {
  if (!src) return null

  // Check if it's a data URI (base64)
  const isDataUri = src.startsWith('data:')

  // If it's a data URI, use regular img tag (next/image doesn't support data URIs well)
  if (isDataUri) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg ${className}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto'
        }}
      />
    )
  }

  // For regular URLs, use next/image for optimization
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
      />
    </div>
  )
}

