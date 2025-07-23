// --- INTERFACES ---
export interface Member {
  id: string
  name: string
  order: number
  hasPaid: boolean
}

export interface BillInputs {
  foodSubtotal: number
  serviceFees: number
  totalPaid: number
  paidBy: string
}

export interface QRCodeItem {
  id: string
  type: string
  imageData: string
}
