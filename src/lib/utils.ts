/**
 * Convert Google Drive share links to direct image URLs
 * Handles various Google Drive URL formats
 */
export function convertGoogleDriveUrl(url: string): string {
    if (!url) return url
  
    // If it's already a direct link, return as is
    if (url.includes('drive.google.com/uc?')) {
      return url
    }
  
    // Extract file ID from various Google Drive URL formats
    let fileId = null
  
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.match(/\/file\/d\/([^\/]+)/)
    if (fileMatch) {
      fileId = fileMatch[1]
    }
  
    // Format: https://drive.google.com/open?id=FILE_ID
    const openMatch = url.match(/[?&]id=([^&]+)/)
    if (openMatch) {
      fileId = openMatch[1]
    }
  
    // If we found a file ID, convert to direct link
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  
    // If not a Google Drive link or couldn't parse, return original
    return url
  }
  
  /**
   * Get image URL with Google Drive conversion if needed
   */
  export function getImageUrl(url: string | null | undefined): string {
    if (!url) return ''
    
    // Check if it's a Google Drive link
    if (url.includes('drive.google.com')) {
      return convertGoogleDriveUrl(url)
    }
    
    return url
  }