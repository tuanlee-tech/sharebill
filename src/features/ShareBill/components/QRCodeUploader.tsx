import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, UploadCloud } from 'lucide-react'
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import type { QRCodeItem } from '../types'

// --- QR CODE UPLOADER COMPONENT ---
interface QRCodeUploaderProps {
  qrCodeList: QRCodeItem[]
  setQrCodeList: (value: QRCodeItem[] | ((prev: QRCodeItem[]) => QRCodeItem[])) => void
}

export default function QRCodeUploader({ qrCodeList, setQrCodeList }: QRCodeUploaderProps) {
  const [selectedQRType, setSelectedQRType] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!selectedQRType) {
        alert('Vui lòng chọn loại QR trước khi tải ảnh!')
        return
      }
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            const newQR: QRCodeItem = {
              id: Date.now().toString(),
              type: selectedQRType,
              imageData: e.target.result as string
            }
            setQrCodeList((prevList: QRCodeItem[]) => [...prevList, newQR])
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [selectedQRType, setQrCodeList]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) handleFileSelect(e.target.files[0])
    },
    [handleFileSelect]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0])
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeQR = useCallback(
    (idToRemove: string) => {
      setQrCodeList((prevList: QRCodeItem[]) => prevList.filter((qr: QRCodeItem) => qr.id !== idToRemove))
    },
    [setQrCodeList]
  )

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-gray-300'>Chọn loại QR để tải lên</label>
      <div className='flex gap-2'>
        <Select value={selectedQRType} onValueChange={setSelectedQRType}>
          <SelectTrigger className='w-full bg-white/10 text-white border-white/20'>
            <SelectValue placeholder='Chọn loại QR' />
          </SelectTrigger>
          <SelectContent className='bg-gray-800 text-white border-gray-700'>
            <SelectItem value='Ngân hàng'>Ngân hàng</SelectItem>
            <SelectItem value='Momo'>Momo</SelectItem>
            <SelectItem value='ZaloPay'>ZaloPay</SelectItem>
            <SelectItem value='ViettelPay'>ViettelPay</SelectItem>
            <SelectItem value='Khác'>Khác</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedQRType}
          className='bg-green-500 hover:bg-green-600 shrink-0'
        >
          <UploadCloud className='h-4 w-4' />
        </Button>
        <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />
      </div>
      <div className='p-2 rounded-md border border-gray-700 bg-white/5' onDrop={handleDrop} onDragOver={handleDragOver}>
        {qrCodeList.length > 0 ? (
          <div className={`grid gap-4 ${qrCodeList.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {qrCodeList.map((qr: QRCodeItem) => (
              <div
                key={qr.id}
                className='relative group overflow-hidden rounded-md flex flex-col items-center justify-center p-2 border border-gray-600'
              >
                <span className='text-xs text-gray-400 absolute top-1 left-2 bg-gray-900 px-1 py-0.5 rounded-sm z-10'>
                  {qr.type}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <img
                      src={qr.imageData}
                      alt={`${qr.type} QR Code`}
                      className='object-contain max-h-[150px] max-w-full rounded-md cursor-pointer '
                    />
                  </DialogTrigger>
                  <DialogContent className='bg-gray-800/90 rounded-lg !max-w-max min-w-[50vw] max-h-[90vh] p-6 text-white'>
                    <DialogHeader>
                      <DialogTitle className='text-lg font-semibold text-white'>QR Code {qr.type} </DialogTitle>
                    </DialogHeader>

                    <div className='flex flex-col items-center'>
                      <img
                        src={qr.imageData}
                        alt={`${qr.type} QR Code`}
                        className='object-contain max-h-[70vh] max-w-[70vw] rounded-md'
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant='destructive'
                  size='icon'
                  className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 z-30'
                  onClick={() => removeQR(qr.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center text-gray-500 py-4'>Kéo và thả ảnh QR vào đây hoặc nhấn nút để tải lên</div>
        )}
      </div>
    </div>
  )
}
