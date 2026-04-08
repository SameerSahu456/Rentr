import { useState, useEffect } from 'react'
import { Search, Package } from 'lucide-react'
import { searchApi } from '../../services/api'
import { SUGGESTIONS, CURATED_CATEGORIES } from '../../constants/navbar'
import { handleImgError } from '../../constants/images'

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SearchDropdown({
  searchQuery,
  searchFocused,
  searchHistory,
  onClearHistory,
  onSelect,
}) {
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (!searchQuery.trim() || !searchFocused) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      searchApi.autocomplete(searchQuery.trim())
        .then(data => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]))
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchFocused])

  if (!searchFocused) return null

  const hasQuery = searchQuery.trim().length > 0
  const hasHistory = searchHistory.length > 0

  const remainingSuggestions = SUGGESTIONS.filter(
    s => !searchHistory.some(h => h.name?.toLowerCase() === s.toLowerCase())
  )

  // Autocomplete results when typing
  if (hasQuery) {
    if (suggestions.length === 0) return null
    return (
      <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-xl py-3 z-50 max-h-80 overflow-y-auto">
        {suggestions.map((s, i) => (
          <button key={`sug-${i}`} onClick={() => onSelect(s)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Search size={14} className="text-gray-400 shrink-0" />
            <span>{highlightMatch(s, searchQuery)}</span>
          </button>
        ))}
      </div>
    )
  }

  // Search history
  if (hasHistory) {
    return (
      <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-xl py-3 z-50 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recent Searches</span>
          <button onClick={onClearHistory} className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer">Clear search history</button>
        </div>
        {searchHistory.map((item, i) => (
          <button key={`hist-${i}`} onClick={() => onSelect(typeof item === 'string' ? item : item.name)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={handleImgError} loading="lazy" />}
            </div>
            <span className="truncate">{typeof item === 'string' ? item : item.name}</span>
          </button>
        ))}
        {remainingSuggestions.length > 0 && (
          <>
            <hr className="my-2 border-gray-100" />
            <div className="px-4 pb-1"><span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Suggestions</span></div>
            {remainingSuggestions.map((s, i) => (
              <button key={`sug-${i}`} onClick={() => onSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                <Search size={14} className="text-gray-400 shrink-0" />{s}
              </button>
            ))}
          </>
        )}
      </div>
    )
  }

  // Default suggestions
  return (
    <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-xl py-3 z-50 max-h-96 overflow-y-auto">
      <div className="px-4 pb-1"><span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Suggestions</span></div>
      {SUGGESTIONS.map((s, i) => (
        <button key={`sug-${i}`} onClick={() => onSelect(s)}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
          <Search size={14} className="text-gray-400 shrink-0" />{s}
        </button>
      ))}
      {CURATED_CATEGORIES.length > 0 && (
        <>
          <hr className="my-2 border-gray-100" />
          <div className="px-4 pb-1"><span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Categories</span></div>
          {CURATED_CATEGORIES.map((cat, i) => (
            <button key={`cat-${i}`} onClick={() => onSelect(cat.name)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Package size={14} className="text-gray-400 shrink-0" />{cat.name}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
