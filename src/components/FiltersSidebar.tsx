'use client'

import { useState } from 'react'
import Link from 'next/link'

export function FiltersSidebar({ currentParams }: { currentParams: any }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-white rounded-sm shadow-md p-5 sticky top-1 lg:w-auto">
      <div className='flex justify-between items-center mb-1'>
        <h2 className="text-[10px] font-press-start mb-4">Filters</h2>
        <div className='mb-2 lg:mb-0'>
          <button
           onClick={() => setIsOpen(!isOpen)}
           className='w-full lg:hidden flex items-center justify-center text-[10px] font-press-start bg-[#E66B1A] text-white py-1 px-3 rounded-md hover:bg-[#D55A1A] transition'
		   aria-label={isOpen ? 'Hide filters' : 'Show filters'}
          >
            <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
          </button>
        </div>
      </div>

      <form action="/games" method="get" className={`space-y-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div>
          <label className="block text-[10px] font-press-start text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            name="search"
            defaultValue={currentParams.search}
            placeholder="Search games..."
            className="w-full text-[10px] font-press-start px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-press-start text-gray-700 mb-2">
            Platform
          </label>
          <select
            name="platform"
            defaultValue={currentParams.platform || ''}
            className="w-full text-[10px] font-press-start px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-[10px] font-press-start" value="">All Platforms</option>
            <option className="text-[10px] font-press-start" value="PS5">PlayStation 5</option>
            <option className="text-[10px] font-press-start" value="PS4">PlayStation 4</option>
            <option className="text-[10px] font-press-start" value="Xbox Series X/S">Xbox Series X/S</option>
            <option className="text-[10px] font-press-start" value="Xbox One">Xbox One</option>
            <option className="text-[10px] font-press-start" value="PC">PC</option>
            <option className="text-[10px] font-press-start" value="Nintendo Switch">Nintendo Switch</option>
            <option className="text-[10px] font-press-start" value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-press-start text-gray-700 mb-2">
            Condition
          </label>
          <select
            name="condition"
            defaultValue={currentParams.condition || ''}
            className="w-full text-[12px] font-press-start px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className="w-full text-[10px] font-press-start bg-[#E66B1A] text-white py-2 rounded-md hover:bg-[#D55A1A] transition"
          >
            Apply Filters
          </button>
          <Link
            href="/games"
            className="block w-full text-[10px] font-press-start text-center py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Clear Filters
          </Link>
        </div>
      </form>
    </div>
  )
}