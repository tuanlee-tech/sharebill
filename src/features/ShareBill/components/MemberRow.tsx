import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableCell, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useMemberContext } from '../hooks/useMemberContext'
import type { Member } from '../types'

// --- MEMBER ROW COMPONENT ---
interface MemberRowProps {
  member: Member
  index: number
  calculateShare: (memberOrder: number) => { foodShare: number; total: number; percentage: number }
  perHeadServiceFee: number
  members: Member[]
  addingNewMemberInputState: { [id: string]: string }
  updateMember: (id: string, key: keyof Member, value: string | number | boolean) => void
  removeMember: (id: string) => void
  handleSaveNewMemberName: (memberId: string) => void
  handleCancelAddNewMemberName: (memberId: string) => void
  handleNameInputChange: (memberId: string, value: string) => void
  handleNameSelectChange: (memberId: string, value: string) => void
}

export function MemberRow({
  member,
  index,
  calculateShare,
  perHeadServiceFee,
  members,
  addingNewMemberInputState,
  updateMember,
  removeMember,
  handleSaveNewMemberName,
  handleCancelAddNewMemberName,
  handleNameInputChange,
  handleNameSelectChange
}: MemberRowProps) {
  const { predefinedMemberNames } = useMemberContext()
  const { foodShare, total, percentage } = calculateShare(member.order)
  const isAddingName = addingNewMemberInputState[member.id] !== undefined
  const availableNames = useMemo(() => {
    const usedNames = new Set(members.filter((m) => m.id !== member.id && m.name !== '').map((m) => m.name))
    return predefinedMemberNames.filter((name) => !usedNames.has(name))
  }, [predefinedMemberNames, members, member.id])

  return (
    <TableRow className={`border-white/10 transition-all ${member.hasPaid ? 'bg-green-950/60' : ''}`}>
      <TableCell>
        <Checkbox
          checked={member.hasPaid}
          onCheckedChange={(checked) => updateMember(member.id, 'hasPaid', checked as boolean)}
        />
      </TableCell>
      <TableCell>
        {isAddingName ? (
          <div className='flex items-center space-x-2'>
            <Input
              placeholder='Nhập tên mới'
              value={addingNewMemberInputState[member.id] || ''}
              onChange={(e) => handleNameInputChange(member.id, e.target.value)}
              className='w-full bg-white/10 text-white border-white/20'
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNewMemberName(member.id)}
            />
            <Button
              size='sm'
              onClick={() => handleSaveNewMemberName(member.id)}
              className='bg-green-500 hover:bg-green-600 text-white'
            >
              Lưu
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleCancelAddNewMemberName(member.id)}
              className='text-gray-400 hover:text-white'
            >
              Hủy
            </Button>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <Select value={member.name} onValueChange={(value) => handleNameSelectChange(member.id, value)}>
              <SelectTrigger className='w-[120px] bg-white/10 text-white border-white/20'>
                <SelectValue>
                  <span className='truncate w-full block'>{member.name || 'Chọn hoặc nhập tên'}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className='bg-gray-800 text-white border-gray-700'>
                <SelectItem value='add_new_member' className='text-blue-400 font-bold cursor-pointer hover:bg-gray-700'>
                  + Thêm thành viên mới
                </SelectItem>
                {availableNames.map((name) => (
                  <SelectItem key={name} value={name} className='hover:bg-gray-700 cursor-pointer'>
                    {name}
                  </SelectItem>
                ))}
                {member.name && predefinedMemberNames.includes(member.name) && (
                  <>
                    <hr className='border-gray-700 my-1' />
                    <SelectItem
                      value={`edit_member_${member.id}`}
                      className='text-yellow-400 hover:bg-gray-700 cursor-pointer'
                    >
                      Sửa tên "{member.name}"
                    </SelectItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SelectItem
                          value={`delete_member_${member.id}`}
                          className='text-red-400 hover:bg-gray-700 cursor-pointer'
                          onSelect={(e) => e.preventDefault()}
                        >
                          Xóa "{member.name}" khỏi danh sách
                        </SelectItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='bg-gray-800 text-white border-gray-700'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-red-400'>
                            Xác nhận xóa thành viên "{member.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription className='text-gray-300'>
                            Thao tác này sẽ xóa thành viên này khỏi danh sách gợi ý và cả khỏi dòng hiện tại nếu chưa
                            chọn tên khác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className='bg-gray-600 hover:bg-gray-700 text-white'>
                            Hủy
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className='bg-red-500 hover:bg-red-600 text-white'
                            onClick={() => handleNameSelectChange(member.id, `delete_member_${member.id}`)}
                          >
                            Xác nhận Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => removeMember(member.id)}
              className='shrink-0'
              data-remove-member='true'
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell>
        <Input
          type='number'
          placeholder='Tiền món gốc'
          value={member.order || ''}
          onChange={(e) => updateMember(member.id, 'order', Number(e.target.value))}
          className='bg-white/10 text-white border-white/20 w-[100px]'
        />
      </TableCell>
      <TableCell className='text-gray-400'>{percentage.toFixed(1)}%</TableCell>
      <TableCell>{foodShare.toLocaleString()}đ</TableCell>
      {index === 0 && (
        <TableCell rowSpan={members.length} className='text-center align-middle bg-white/5'>
          <span>{Math.round(perHeadServiceFee).toLocaleString()}đ</span>
        </TableCell>
      )}
      <TableCell
        className={`font-bold text-lg text-center ${member.hasPaid ? `bg-green-900 text-yellow-500` : `bg-orange-950`}`}
      >
        {total.toLocaleString()}đ
      </TableCell>
    </TableRow>
  )
}
