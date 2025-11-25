'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AddGamePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PS5',
    condition: 'Like New',
    description: '',
    images: [''],
    genre: ['']
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/games/add')
    }
  }, [status, router])
  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[10px] font-press-start text-gray-600">Checking authentication</p>
      </div>
    )
  }
  
  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (imageFiles.length === 0) {
      setError('Please select at least one image file.')
      setIsLoading(false)
      return
    }
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not set in environment variables.');
      }
      const uploadPromises = imageFiles.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', 'game_trade');
        formDataUpload.append('cloud_name', cloudName);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formDataUpload,
          }
        );
        if (!res.ok) throw new Error('Images upload failed');
        const data = await res.json();
        return data.secure_url;
      });

      const uploadedImageUrls = await Promise.all(uploadPromises);
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImageUrls,
          genre: formData.genre.filter(g => g.trim() !== '')
        }),
      });

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add game')
      }

      alert('Game added successfully!')
      router.push('/games')
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false)
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  }
  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index != indexToRemove))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-press-start mb-8 text-[#E66B1A]">Add New Game</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-[10px] font-press-start px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
              placeholder="e.g., God of War Ragnarök"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Platform *
            </label>
            <select
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
            >
              <option value="PS5">PlayStation 5</option>
              <option value="PS4">PlayStation 4</option>
              <option value="Xbox Series X/S">Xbox Series X/S</option>
              <option value="Xbox One">Xbox One</option>
              <option value="PC">PC</option>
              <option value="Nintendo Switch">Nintendo Switch</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Condition *
            </label>
            <select
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
              placeholder="Describe the game condition, any extras included, etc."
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept='image/jpeg,image/png'
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
              placeholder="https://example.com/image.jpg"
            />
            {imageFiles.length > 0 && (
              <div className='mt-2 space-y-2'>
                {imageFiles.map((file, index) => (
                  <div key={index} className='flex items-center justify-between bg-gray-50 p-2 rounded'>
                    <span className='text-sm truncate max-w-[200px]'>{file.name}</span>
                    <button
                      type='button'
                      onClick={() => removeImage(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className='text-[10px] font-press-start text-gray-500 mt-1'>
              {imageFiles.length === 0 ? "Image is required" : `${imageFiles.length} images selected`}
            </p>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-[10px] font-press-start text-[#E66B1A] mb-2">
              Genre
            </label>
            <input
              type="text"
              value={formData.genre[0]}
              onChange={(e) => setFormData({ 
                ...formData, 
                genre: e.target.value.split(',').map(g => g.trim()) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E66B1A]"
              placeholder="e.g., Action, Adventure, RPG"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-[10px] font-press-start bg-[#E66B1A] text-white py-2 px-4 rounded-md hover:bg-[#D55A1A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding Game...' : 'Add Game'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[10px] font-press-start px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
