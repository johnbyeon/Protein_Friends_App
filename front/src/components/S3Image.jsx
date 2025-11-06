import { useState, useEffect } from 'react'
import { getViewUrl } from '../lib/s3'

const S3Image = ({ s3Key, alt, className = '', fallback = null }) => {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!s3Key) {
      setLoading(false)
      setError(true)
      return
    }

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(false)
        const url = await getViewUrl(s3Key)
        setImageUrl(url)
      } catch (err) {
        console.error('Failed to load image:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [s3Key])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-700 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return fallback || (
      <div className={`flex items-center justify-center bg-gray-700 ${className}`}>
        <span className="material-symbols-outlined text-gray-400">image</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.onerror = null
        setError(true)
      }}
    />
  )
}

export default S3Image