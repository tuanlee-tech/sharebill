import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useMemberContext } from '../hooks/useMemberContext'
import type { BillInputs, Member } from '../types'
import { MemberRow } from './MemberRow'
// --- MEMBERS TABLE COMPONENT ---
interface MembersTableProps {
  members: Member[]
  setMembers: (value: Member[] | ((prev: Member[]) => Member[])) => void
  bill: BillInputs
  perHeadServiceFee: number
  totalMemberFoodOrders: number
  calculateShare: (memberOrder: number) => { foodShare: number; total: number; percentage: number }
}

export default function MembersTable({
  members,
  setMembers,
  bill,
  perHeadServiceFee,
  totalMemberFoodOrders,
  calculateShare
}: MembersTableProps) {
  const { addMemberName, removeMemberName, updateMemberName } = useMemberContext()
  const [addingNewMemberInputState, setAddingNewMemberInputState] = useState<{ [id: string]: string }>({})
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

  const updateMember = useCallback(
    (id: string, key: keyof Member, value: string | number | boolean) => {
      setMembers((prev: Member[]) =>
        prev.map((m: Member) => {
          if (m.id !== id) return m
          if (key === 'order') {
            const newOrder = Number(value)
            const currentTotalOrdersExcludingThis = totalMemberFoodOrders - m.order
            if (newOrder < 0) {
              alert('Số tiền món gốc không thể là số âm.')
              return m
            }
            if (bill.foodSubtotal > 0 && currentTotalOrdersExcludingThis + newOrder > bill.foodSubtotal) {
              alert(
                `Tổng tiền món gốc của các thành viên không thể vượt quá ${bill.foodSubtotal.toLocaleString()}đ (Tổng tiền món ban đầu của hóa đơn).`
              )
              return m
            }
          }
          return { ...m, [key]: value }
        })
      )
    },
    [setMembers, totalMemberFoodOrders, bill.foodSubtotal]
  )

  const addMemberRow = useCallback(() => {
    const newMemberId = Date.now().toString()
    setMembers((prev) => [...prev, { id: newMemberId, name: '', order: 0, hasPaid: false }])
  }, [setMembers])

  const removeMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id))
      setAddingNewMemberInputState((prev) => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      setEditingMemberId(null)
    },
    [setMembers, setAddingNewMemberInputState]
  )

  const handleSaveNewMemberName = useCallback(
    (memberId: string) => {
      const trimmedName = addingNewMemberInputState[memberId]?.trim()
      if (!trimmedName) {
        alert('Tên thành viên không được để trống!')
        return
      }
      if (members.some((m) => m.name.toLowerCase() === trimmedName.toLowerCase() && m.id !== memberId)) {
        alert('Thành viên đã tồn tại trong danh sách!')
        return
      }
      if (editingMemberId) {
        const oldName = members.find((m) => m.id === memberId)?.name
        if (oldName && oldName !== trimmedName) {
          updateMemberName(oldName, trimmedName)
        }
      } else {
        addMemberName(trimmedName)
      }
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, name: trimmedName } : m)))
      setAddingNewMemberInputState((prev) => {
        const newState = { ...prev }
        delete newState[memberId]
        return newState
      })
      setEditingMemberId(null)
    },
    [
      members,
      addingNewMemberInputState,
      editingMemberId,
      setMembers,
      addMemberName,
      updateMemberName,
      setAddingNewMemberInputState
    ]
  )

  const handleCancelAddNewMemberName = useCallback(
    (memberId: string) => {
      if (members.find((m) => m.id === memberId && m.name === '')) {
        removeMember(memberId)
      }
      setAddingNewMemberInputState((prev) => {
        const newState = { ...prev }
        delete newState[memberId]
        return newState
      })
      setEditingMemberId(null)
    },
    [members, removeMember, setAddingNewMemberInputState]
  )

  const handleNameInputChange = useCallback(
    (memberId: string, value: string) => {
      setAddingNewMemberInputState((prev) => ({ ...prev, [memberId]: value }))
    },
    [setAddingNewMemberInputState]
  )

  const handleNameSelectChange = useCallback(
    (memberId: string, value: string) => {
      if (value === 'add_new_member') {
        setAddingNewMemberInputState((prev) => ({ ...prev, [memberId]: '' }))
        setEditingMemberId(null)
      } else if (value.startsWith('edit_member_')) {
        setAddingNewMemberInputState((prev) => ({
          ...prev,
          [memberId]: members.find((m) => m.id === memberId)?.name || ''
        }))
        setEditingMemberId(memberId)
      } else if (value.startsWith('delete_member_')) {
        const memberName = members.find((m) => m.id === memberId)?.name
        if (memberName) {
          removeMemberName(memberName)
          updateMember(memberId, 'name', '')
        }
      } else {
        updateMember(memberId, 'name', value)
        setAddingNewMemberInputState((prev) => {
          const newState = { ...prev }
          delete newState[memberId]
          return newState
        })
        setEditingMemberId(null)
      }
    },
    [members, updateMember, removeMemberName, setAddingNewMemberInputState]
  )

  return (
    <Card className='bg-white/5 border-white/10 backdrop-blur-sm'>
      <CardHeader>
        <CardTitle>2. Thành Viên</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-white/10'>
                <TableHead className='text-white min-w-[65px]'>Đã trả</TableHead>
                <TableHead className='text-white min-w-[120px]'>Họ Tên</TableHead>
                <TableHead className='text-white min-w-[100px]'>Tiền món (gốc)</TableHead>
                <TableHead className='text-white'>%</TableHead>
                <TableHead className='text-white'>
                  <div>
                    <p>Tiền món</p>
                    <p className='text-xs text-gray-400'>(giảm giá)</p>
                  </div>
                </TableHead>
                <TableHead className='text-white'>Phí dịch vụ</TableHead>
                <TableHead className='text-white font-bold min-w-[150px] !text-center'>Phải trả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, index) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  index={index}
                  calculateShare={calculateShare}
                  perHeadServiceFee={perHeadServiceFee}
                  members={members}
                  addingNewMemberInputState={addingNewMemberInputState}
                  updateMember={updateMember}
                  removeMember={removeMember}
                  handleSaveNewMemberName={handleSaveNewMemberName}
                  handleCancelAddNewMemberName={handleCancelAddNewMemberName}
                  handleNameInputChange={handleNameInputChange}
                  handleNameSelectChange={handleNameSelectChange}
                />
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className='text-center text-gray-500 py-4'>
                    <p>Chưa có thành viên nào. Hãy thêm một người!</p>
                    <Button size='sm' onClick={addMemberRow} className='bg-blue-500 hover:bg-blue-600 my-2'>
                      <Plus className='h-4 w-4' /> Thêm người
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {members.length > 0 && (
        <CardFooter>
          <Button size='sm' onClick={addMemberRow} className='bg-blue-500 hover:bg-blue-600 my-1'>
            <Plus className='h-4 w-4 mr-2' /> Thêm người
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
