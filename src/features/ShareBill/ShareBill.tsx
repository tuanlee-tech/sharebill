import { useCallback, useEffect } from 'react'
import BillInput from './components/BillInput'
import MembersTable from './components/MembersTable'
import SummaryPayment from './components/SummaryPayment'
import { MemberProvider } from './context/MemberProvider'
import { useLocalStorage } from './hooks/useLocalStorage'
import ShareBillHelmet from './seo/ShareBillHelmet'
import type { BillInputs, Member, QRCodeItem } from './types'

// --- MAIN SHARE BILL COMPONENT ---
export default function ShareBill() {
  const [members, setMembers] = useLocalStorage<Member[]>('billMembers', [])
  const [bill, setBill] = useLocalStorage<BillInputs>('billDetails', {
    foodSubtotal: 0,
    serviceFees: 0,
    totalPaid: 0,
    paidBy: ''
  })
  const [lastUpdated, setLastUpdated] = useLocalStorage<string | null>('lastUpdated', null)

  const [qrCodeList, setQrCodeList] = useLocalStorage<QRCodeItem[]>('qrCodeList', [])

  // --- CÁC GIÁ TRỊ TỰ ĐỘNG TÍNH TOÁN ---
  const { totalPaid, foodSubtotal, serviceFees } = bill
  const totalDiscount = foodSubtotal + serviceFees - totalPaid
  const finalFoodTotal = totalPaid - serviceFees
  const totalOriginalOrder = members.reduce((sum, m) => sum + Number(m.order), 0)
  const perHeadServiceFee = members.length > 0 ? serviceFees / members.length : 0
  const totalMemberFoodOrders = members.reduce((sum, m) => sum + m.order, 0)

  const calculateShare = useCallback(
    (memberOrder: number) => {
      const ratio = totalOriginalOrder > 0 ? memberOrder / totalOriginalOrder : 0
      const foodShare = finalFoodTotal * ratio
      const total = foodShare + perHeadServiceFee
      const calculatedPercentage = ratio * 100
      const finalPercentage = calculatedPercentage > 0 ? calculatedPercentage : 0
      return {
        foodShare: Math.round(foodShare),
        total: Math.round(total),
        percentage: finalPercentage
      }
    },
    [totalOriginalOrder, finalFoodTotal, perHeadServiceFee]
  )

  const totalReceived = members.reduce((sum, member) => {
    if (member.hasPaid) {
      const { total } = calculateShare(member.order)
      return sum + total
    }
    return sum
  }, 0)

  // --- useEffect để cập nhật thời gian lưu ---
  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleString())
    }
    updateTime()
  }, [members, bill, qrCodeList, setLastUpdated])

  // --- HÀM XỬ LÝ ---
  const updateBill = (key: keyof BillInputs, value: string) => {
    const newValue = key === 'foodSubtotal' || key === 'serviceFees' || key === 'totalPaid' ? Number(value) || 0 : value
    setBill({ ...bill, [key]: newValue })
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-4 md:p-8 font-sans'>
      <ShareBillHelmet />
      <div className='max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <MemberProvider>
          <div className='lg:col-span-2 space-y-6'>
            <BillInput bill={bill} updateBill={updateBill} />
            <MembersTable
              members={members}
              setMembers={setMembers}
              bill={bill}
              perHeadServiceFee={perHeadServiceFee}
              totalMemberFoodOrders={totalMemberFoodOrders}
              calculateShare={calculateShare}
            />
          </div>
          <div className='lg:col-span-1 space-y-6'>
            <SummaryPayment
              bill={bill}
              updateBill={updateBill}
              totalPaid={totalPaid}
              totalDiscount={totalDiscount}
              totalReceived={totalReceived}
              totalMemberFoodOrders={totalMemberFoodOrders}
              lastUpdated={lastUpdated}
              qrCodeList={qrCodeList}
              setQrCodeList={setQrCodeList}
            />
          </div>
        </MemberProvider>
      </div>
    </div>
  )
}
