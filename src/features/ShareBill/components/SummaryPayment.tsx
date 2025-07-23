import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BillInputs, QRCodeItem } from '../types'
import ActionButtons from './ActionButtons'
import { PayerInput } from './PayerInput'
import QRCodeUploader from './QRCodeUploader'
import SummaryDisplay from './SummaryDisplay'

// --- SUMMARY AND PAYMENT COMPONENT ---
interface SummaryPaymentProps {
  bill: BillInputs
  updateBill: (key: keyof BillInputs, value: string) => void
  totalPaid: number
  totalReceived: number
  totalMemberFoodOrders: number
  totalDiscount: number // Thêm totalDiscount vào props
  lastUpdated: string | null
  qrCodeList: QRCodeItem[]
  setQrCodeList: (value: QRCodeItem[] | ((prev: QRCodeItem[]) => QRCodeItem[])) => void
}
// --- MAIN SUMMARY PAYMENT COMPONENT ---
export default function SummaryPayment({
  bill,
  updateBill,
  totalPaid,
  totalReceived,
  totalMemberFoodOrders,
  totalDiscount,
  lastUpdated,
  qrCodeList,
  setQrCodeList
}: SummaryPaymentProps) {
  return (
    <Card className='bg-white/5 border-white/10 backdrop-blur-sm sticky top-8 card'>
      <CardHeader>
        <CardTitle>3. Tóm Tắt & Thanh Toán</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <PayerInput paidBy={bill.paidBy} updateBill={updateBill} />
        <hr className='border-white/10 my-4' />
        <SummaryDisplay
          totalReceived={totalReceived}
          totalPaid={totalPaid}
          totalDiscount={totalDiscount}
          totalMemberFoodOrders={totalMemberFoodOrders}
          foodSubtotal={bill.foodSubtotal}
          lastUpdated={lastUpdated}
        />
        <hr className='border-white/10 my-4' />
        <QRCodeUploader qrCodeList={qrCodeList} setQrCodeList={setQrCodeList} />
        <hr className='border-white/10 my-4' />
        <ActionButtons updateBill={updateBill} setQrCodeList={setQrCodeList} />
      </CardContent>
    </Card>
  )
}
