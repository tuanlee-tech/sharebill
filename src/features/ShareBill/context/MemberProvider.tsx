import { useCallback, useMemo } from 'react'
import { group_members } from '../constant'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MemberContext } from './MemberContext'

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [predefinedMemberNames, setPredefinedMemberNames] = useLocalStorage<string[]>(
    'predefinedMemberNames',
    group_members
  )

  const addMemberName = useCallback(
    (name: string) => {
      const trimmedName = name.trim()
      if (trimmedName && !predefinedMemberNames.includes(trimmedName)) {
        setPredefinedMemberNames((prev) => [...prev, trimmedName].sort())
      }
    },
    [predefinedMemberNames, setPredefinedMemberNames]
  )

  const removeMemberName = useCallback(
    (name: string) => {
      setPredefinedMemberNames((prev) => prev.filter((n) => n !== name).sort())
      console.log(`Removed member name: ${name}`)
    },
    [setPredefinedMemberNames]
  )

  const updateMemberName = useCallback(
    (oldName: string, newName: string) => {
      const trimmedNewName = newName.trim()
      if (trimmedNewName && trimmedNewName !== oldName && !predefinedMemberNames.includes(trimmedNewName)) {
        setPredefinedMemberNames((prev) => prev.map((n) => (n === oldName ? trimmedNewName : n)).sort())
        console.log(`Updated member name from ${oldName} to ${trimmedNewName}`)
      }
    },
    [predefinedMemberNames, setPredefinedMemberNames]
  )

  const contextValue = useMemo(
    () => ({
      predefinedMemberNames,
      addMemberName,
      removeMemberName,
      updateMemberName
    }),
    [predefinedMemberNames, addMemberName, removeMemberName, updateMemberName]
  )

  return <MemberContext.Provider value={contextValue}>{children}</MemberContext.Provider>
}
