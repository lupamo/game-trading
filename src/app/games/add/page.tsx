'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { set } from 'zod'


export default function AddGamePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PS5',
    condition: 'Like New',
    description: '',
    images: [''],
    genre: ['']
  })

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!imageFile) {
      setError('Please select an image file.')
      setIsLoading(false)
      return
    }
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not set in environment variables.');
      }
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);
      formDataUpload.append('upload_preset', 'game_trade');
      formDataUpload.append('cloud_name', cloudName);


      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error.message || 'Image upload failed');
      }
      const imageUrl = uploadData.secure_url;
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: [imageUrl], 
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
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Add New Game</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., God of War Ragnarök"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Platform *
            </label>
            <select
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition *
            </label>
            <select
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the game condition, any extras included, etc."
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept='image/jpeg,image/png'
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {imageFile && (
              <p className='text-sm text-gray-500 mt-1'>
                Selected: {imageFile.name}
              </p>
            )}
            <p className='text-xs text-gray-500 mt-1'>
              Image is required
            </p>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre (comma-separated)
            </label>
            <input
              type="text"
              value={formData.genre[0]}
              onChange={(e) => setFormData({ 
                ...formData, 
                genre: e.target.value.split(',').map(g => g.trim()) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding Game...' : 'Add Game'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
