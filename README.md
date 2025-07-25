# Influenchi Platform

## File Upload System

### Supported Logo Formats
- **PNG** - Recommended for logos with transparency
- **JPEG/JPG** - Good for photographic logos  
- **GIF** - Supports animation
- **WebP** - Modern format with excellent compression
- **SVG** - Vector format, perfect for scalable logos

### File Size Limits
- **Maximum**: 5MB per file
- **Recommended**: Under 1MB for optimal performance
- **Auto-compression**: Applied to large raster images (PNG, JPEG, etc.)
- **SVG handling**: No compression applied, preserves vector quality

### Validation Features
- Real-time file type validation
- File size checking with detailed feedback
- Clear error messages with specific requirements
- Visual success/error indicators
- Automatic image optimization for large files

### Storage Architecture
- **Supabase Storage**: Dedicated object storage for files
- **CDN Delivery**: Global edge caching for fast loading
- **URL-based References**: Database stores URLs, not file data
- **Cost Optimization**: ~85% cheaper than database blob storage

## Development Scripts

```bash
# Set up storage bucket with proper configuration
node scripts/setup-storage.js

# Update existing bucket to include SVG support  
node scripts/update-storage-bucket.js
```
