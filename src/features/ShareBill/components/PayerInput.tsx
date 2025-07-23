import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCallback, useState } from 'react'
import { useMemberContext } from '../hooks/useMemberContext'
import type { BillInputs } from '../types'

// --- PAYER INPUT COMPONENT ---
interface PayerInputProps {
  paidBy: string
  updateBill: (key: keyof BillInputs, value: string) => void
}

export function PayerInput({ paidBy, updateBill }: PayerInputProps) {
  const { predefinedMemberNames, addMemberName } = useMemberContext()
  const [isAddingNewPayer, setIsAddingNewPayer] = useState<boolean>(false)
  const [newPayerName, setNewPayerName] = useState<string>('')

  const handleSaveNewPayer = useCallback(() => {
    const trimmedName = newPayerName.trim()
    if (!trimmedName) {
      alert('Tên người thanh toán không được để trống!')
      return
    }
    if (predefinedMemberNames.some((name) => name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Tên này đã tồn tại trong danh sách!')
      return
    }
    addMemberName(trimmedName)
    updateBill('paidBy', trimmedName)
    setNewPayerName('')
    setIsAddingNewPayer(false)
  }, [newPayerName, predefinedMemberNames, addMemberName, updateBill])

  const handleCancelAddPayer = useCallback(() => {
    setNewPayerName('')
    setIsAddingNewPayer(false)
  }, [])

  const handlePayerInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPayerName(e.target.value)
  }, [])

  const handlePayerSelectChange = useCallback(
    (value: string) => {
      if (value === 'add_new_payer') {
        setIsAddingNewPayer(true)
      } else {
        updateBill('paidBy', value)
        setIsAddingNewPayer(false)
      }
    },
    [updateBill]
  )

  return (
    <div className='space-y-1'>
      <label className='text-sm font-medium text-gray-300'>Người thanh toán</label>
      {isAddingNewPayer ? (
        <div className='flex items-center space-x-2'>
          <Input
            placeholder='Nhập tên mới'
            value={newPayerName}
            onChange={handlePayerInputChange}
            className='w-full bg-white/10 text-white border-white/20'
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveNewPayer()
              }
            }}
          />
          <Button size='sm' onClick={handleSaveNewPayer} className='bg-green-500 hover:bg-green-600 text-white'>
            Lưu
          </Button>
          <Button variant='ghost' size='sm' onClick={handleCancelAddPayer} className='text-gray-400 hover:text-white'>
            Hủy
          </Button>
        </div>
      ) : (
        <Select value={paidBy} onValueChange={handlePayerSelectChange}>
          <SelectTrigger className='w-full bg-white/10 text-white border-white/20'>
            <SelectValue placeholder='Chọn hoặc nhập tên người thanh toán' />
          </SelectTrigger>
          <SelectContent className='bg-gray-800 text-white border-gray-700'>
            <SelectItem value='add_new_payer' className='text-blue-400 font-bold cursor-pointer hover:bg-gray-700'>
              + Thêm người thanh toán mới
            </SelectItem>
            {predefinedMemberNames.map((name) => (
              <SelectItem key={name} value={name} className='hover:bg-gray-700 cursor-pointer'>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
