import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

export // Hook để quản lý danh sách tên và trạng thái thêm/sửa tên
function useMemberNames(initialNames: string[]) {
  const [predefinedMemberNames, setPredefinedMemberNames] = useLocalStorage<string[]>(
    'predefinedMemberNames',
    initialNames
  )
  const [addingNewMemberInputState, setAddingNewMemberInputState] = useState<{ [id: string]: string }>({})
  const [editingOldMemberName, setEditingOldMemberName] = useState<string | null>(null)

  // Side effect để đồng bộ danh sách tên từ localStorage
  useEffect(() => {
    const storedNames = localStorage.getItem('predefinedMemberNames')
    if (storedNames) {
      try {
        const parsedNames = JSON.parse(storedNames)
        if (Array.isArray(parsedNames) && parsedNames.every((name) => typeof name === 'string')) {
          setPredefinedMemberNames(parsedNames.sort())
        }
      } catch (error) {
        console.error('Lỗi khi load predefinedMemberNames từ localStorage:', error)
      }
    }
  }, [setPredefinedMemberNames])

  return {
    predefinedMemberNames,
    setPredefinedMemberNames,
    addingNewMemberInputState,
    setAddingNewMemberInputState,
    editingOldMemberName,
    setEditingOldMemberName
  }
}
