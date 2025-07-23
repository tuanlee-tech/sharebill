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
import { HelpCircle, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { BillInputs, QRCodeItem } from '../types'
// --- ACTION BUTTONS COMPONENT ---
interface ActionButtonsProps {
  updateBill: (key: keyof BillInputs, value: string) => void
  setQrCodeList: (value: QRCodeItem[] | ((prev: QRCodeItem[]) => QRCodeItem[])) => void
}

export default function ActionButtons({ updateBill, setQrCodeList }: ActionButtonsProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(5)
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null)

  const deleteBillData = () => {
    updateBill('foodSubtotal', '0')
    updateBill('serviceFees', '0')
    updateBill('totalPaid', '0')
    updateBill('paidBy', '')
    setQrCodeList([])
  }

  const handleStartDeleteCountdown = () => {
    setIsDeleting(true)
    setCountdown(5)
    if (deleteTimerRef.current) clearInterval(deleteTimerRef.current)
    deleteTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(deleteTimerRef.current!)
          deleteBillData()
          setIsDeleting(false)
          setIsConfirmingDelete(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCancelDelete = () => {
    if (deleteTimerRef.current) {
      clearInterval(deleteTimerRef.current)
    }
    setIsDeleting(false)
    setCountdown(5)
    setIsConfirmingDelete(false)
  }

  return (
    <>
      <div className='flex flex-col gap-3'>
        <Button
          className='w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2'
          onClick={() => setShowExplanation(true)}
        >
          <HelpCircle className='h-5 w-5' />
          Giải thích cách tính
        </Button>
        <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' className='w-full'>
              <Trash2 className='h-4 w-4 mr-2' />
              Xóa dữ liệu Bill cũ
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='bg-gray-800 text-white border-gray-700'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-red-400'>Xác nhận xóa Bill?</AlertDialogTitle>
              <AlertDialogDescription className='text-gray-300'>
                {isDeleting
                  ? `Đang xóa bill của bạn... (${countdown}s còn lại)`
                  : 'Hành động này sẽ xóa toàn bộ thông tin bill (tiền món, phí dịch vụ, tổng thực trả) và reset số tiền món của thành viên. Bạn có chắc muốn tiếp tục?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className='bg-gray-600 hover:bg-gray-700 text-white hover:text-white'
                onClick={handleCancelDelete}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className='bg-red-500 hover:bg-red-600 text-white'
                onClick={(e) => {
                  e.preventDefault()
                  handleStartDeleteCountdown()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? `Đang xóa (${countdown}s)` : 'Xác nhận Xóa'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AlertDialog open={showExplanation} onOpenChange={setShowExplanation}>
        <AlertDialogContent className='bg-gray-800 text-white border-gray-700 max-w-3xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-[90vw] max-h-[80vh] overflow-y-auto'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-blue-400'>Cách ứng dụng chia tiền hóa đơn</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-300 space-y-4 text-left'>
              <p>
                Ứng dụng này giúp bạn chia sẻ chi phí hóa đơn một cách công bằng dựa trên
                <strong> Tiền món (gốc) </strong> mà mỗi người đã gọi và
                <strong> Tổng phí dịch vụ </strong> được chia đều cho tất cả thành viên.
              </p>
              <div>
                <h3 className='font-bold text-white text-md mb-1'>Cơ chế tính toán:</h3>
                <ul className='list-disc list-inside space-y-2'>
                  <li>
                    <strong>Tiền món (gốc):</strong> Là số tiền món ăn riêng của mỗi người. Bạn cần nhập đúng số tiền
                    món mình đã gọi.
                    <br />
                    <em>
                      Ví dụ: Nhóm có 3 người. Tổng tiền món là 600.000đ. Bạn gọi món hết 180.000đ, thì phần của bạn
                      chiếm 30% tổng tiền món.
                    </em>
                  </li>
                  <li>
                    <strong>Tổng tiền món ăn cần chia:</strong> Là tổng tiền món trên hóa đơn sau khi đã trừ đi các
                    khoản giảm giá, tính từ tổng thực trả.
                    <br />
                    <em>Ví dụ: Tổng thực trả là 540.000đ, phí dịch vụ 30.000đ → Tổng tiền món cần chia là 510.000đ.</em>
                  </li>
                  <li>
                    <strong>Tiền món (chia):</strong> Là phần bạn thực sự phải trả, tính theo tỉ lệ phần ăn gốc bạn đã
                    gọi so với tổng món.
                    <br />
                    <em>Ví dụ: Phần của bạn chiếm 30%, thì bạn sẽ trả 30% của 510.000đ → tức 153.000đ.</em>
                  </li>
                  <li>
                    <strong>Phí dịch vụ:</strong> Là các khoản phí như phí giao hàng, phụ thu,... được chia đều cho tất
                    cả thành viên.
                    <br />
                    <em>Ví dụ: Phí ship là 30.000đ, nhóm có 3 người → mỗi người trả 10.000đ.</em>
                  </li>
                  <li>
                    <strong>Tổng Trả:</strong> Là tổng số tiền bạn phải trả, gồm Tiền món (chia) + Phí dịch vụ.
                    <br />
                    <em>Ví dụ: Tiền món của bạn là 153.000đ, phí dịch vụ là 10.000đ → Tổng bạn cần trả là 163.000đ.</em>
                  </li>
                </ul>
              </div>
              <p className='mt-4'>
                <strong>
                  <ins>Lưu ý quan trọng:</ins>
                </strong>{' '}
                Tổng
                <strong> Tiền món (gốc) </strong> của tất cả thành viên
                <strong> không được lớn hơn </strong>
                <strong> Tổng tiền món ban đầu </strong> của hóa đơn. Nếu tổng bạn nhập nhỏ hơn, ứng dụng sẽ tự động
                chia phần còn thiếu theo tỉ lệ đã có.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowExplanation(false)}
              className='bg-blue-500 hover:bg-blue-600 text-white'
            >
              Đã hiểu!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
