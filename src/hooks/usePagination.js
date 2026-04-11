import { useState, useMemo } from 'react'

export default function usePagination(items, pageSize = 12) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const reset = () => setCurrentPage(1)

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    reset,
    pageSize,
    totalItems: items.length,
  }
}
