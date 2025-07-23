import { Helmet } from 'react-helmet-async'

export default function ShareBillHelmet() {
  return (
    <Helmet>
      <title>ShareBill - Chia hóa đơn dễ dàng</title>
      <meta
        name='description'
        content='ShareBill giúp bạn chia hóa đơn công bằng dựa trên món ăn mỗi người gọi và phí dịch vụ, hỗ trợ thanh toán qua QR code.'
      />
      <meta name='keywords' content='chia hóa đơn, tính tiền, chia tiền nhóm, QR code, thanh toán, quản lý hóa đơn' />
      <meta name='author' content='TuanLee' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta property='og:title' content='ShareBill - Chia hóa đơn dễ dàng' />
      <meta
        property='og:description'
        content='Chia sẻ chi phí hóa đơn một cách công bằng và dễ dàng với ShareBill. Hỗ trợ nhập món ăn, phí dịch vụ, và lưu mã QR thanh toán.'
      />
      <meta property='og:type' content='website' />
      <meta property='og:image' content='/og-image.png' />
      <meta property='og:url' content='https://sharebill.vercel.app/' />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content='ShareBill - Chia hóa đơn dễ dàng' />
      <meta
        name='twitter:description'
        content='Chia hóa đơn công bằng và quản lý thanh toán dễ dàng với ShareBill. Hỗ trợ QR code và tính toán tự động.'
      />
      <meta name='twitter:image' content='/og-image.png' />
    </Helmet>
  )
}
