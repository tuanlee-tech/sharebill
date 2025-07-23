import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { BillInputs } from '../types'

// --- BILL INPUT COMPONENT ---
export interface BillInputProps {
  bill: BillInputs
  updateBill: (key: keyof BillInputs, value: string) => void
}

export default function BillInput({ bill, updateBill }: BillInputProps) {
  return (
    <Card className='bg-white/5 border-white/10 backdrop-blur-sm card'>
      <CardHeader>
        <CardTitle>1. Hóa Đơn</CardTitle>
      </CardHeader>
      <CardContent className='grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-300'>Tổng tiền món ban đầu</label>
          <Input
            type='number'
            placeholder='ví dụ: 500000'
            value={bill.foodSubtotal || ''}
            onChange={(e) => updateBill('foodSubtotal', e.target.value)}
            className='bg-white/10 text-white border-white/20'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-300'>Tổng phí dịch vụ (ship, v.v.)</label>
          <Input
            type='number'
            placeholder='ví dụ: 30000'
            value={bill.serviceFees || ''}
            onChange={(e) => updateBill('serviceFees', e.target.value)}
            className='bg-white/10 text-white border-white/20'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-300'>Tổng thực trả</label>
          <Input
            type='number'
            placeholder='ví dụ: 450000'
            value={bill.totalPaid || ''}
            onChange={(e) => updateBill('totalPaid', e.target.value)}
            className='bg-white/10 text-white border-white/20'
          />
        </div>
      </CardContent>
    </Card>
  )
}
