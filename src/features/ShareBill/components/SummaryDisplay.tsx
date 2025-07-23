// --- SUMMARY DISPLAY COMPONENT ---
interface SummaryDisplayProps {
  totalReceived: number
  totalPaid: number
  totalDiscount: number
  totalMemberFoodOrders: number
  foodSubtotal: number
  lastUpdated: string | null
}

export default function SummaryDisplay({
  totalReceived,
  totalPaid,
  totalDiscount,
  totalMemberFoodOrders,
  foodSubtotal,
  lastUpdated
}: SummaryDisplayProps) {
  return (
    <div className='space-y-2 text-lg'>
      <div className='flex justify-between items-center'>
        <span className='text-gray-300'>Tổng đã nhận:</span>
        <span className='font-bold text-green-400'>{totalReceived.toLocaleString()}đ</span>
      </div>
      <div className='flex justify-between items-center text-2xl'>
        <span className='font-semibold'>Tổng cần trả:</span>
        <span className='font-extrabold text-cyan-400'>{totalPaid.toLocaleString()}đ</span>
      </div>
      <div className='flex justify-between items-center text-sm text-gray-400'>
        <span className='text-gray-400'>Tổng giảm giá:</span>
        <span className='font-bold text-gray-400'>{totalDiscount.toLocaleString()}đ</span>
      </div>
      <div className='flex justify-between items-center text-sm text-gray-400'>
        <span className='text-gray-400'>Tổng tiền món gốc của thành viên:</span>
        <span className={`font-bold ${totalMemberFoodOrders > foodSubtotal ? 'text-red-400' : 'text-gray-400'}`}>
          {totalMemberFoodOrders.toLocaleString()}đ
        </span>
      </div>
      {lastUpdated && <div className='text-sm text-gray-400 text-right mt-2'>Cập nhật lần cuối: {lastUpdated}</div>}
    </div>
  )
}
