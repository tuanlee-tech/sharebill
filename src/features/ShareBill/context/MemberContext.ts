import { createContext } from 'react'

// --- MEMBER CONTEXT ---
interface MemberContextType {
  predefinedMemberNames: string[]
  addMemberName: (name: string) => void
  removeMemberName: (name: string) => void
  updateMemberName: (oldName: string, newName: string) => void
}

export const MemberContext = createContext<MemberContextType | undefined>(undefined)
