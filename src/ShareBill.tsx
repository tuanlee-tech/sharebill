import { Plus, Trash2, UploadCloud, HelpCircle } from "lucide-react";
import { useRef, useState, useEffect, useCallback, type ChangeEvent, type DragEvent } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
import { Helmet } from 'react-helmet-async';

// --- INTERFACES ---
interface Member {
  id: string;
  name: string;
  order: number;
  hasPaid: boolean;
}

interface BillInputs {
  foodSubtotal: number;
  serviceFees: number;
  totalDiscount: number;
  paidBy: string;
}

interface QRCodeItem {
  id: string;
  type: string;
  imageData: string;
}

// --- HOOK LOCAL STORAGE ---
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Lỗi khi đọc từ localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Lỗi khi ghi vào localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

// --- COMPONENT CHÍNH ---
export default function ShareBill() {
  const [members, setMembers] = useLocalStorage<Member[]>("billMembers", []);
  const [bill, setBill] = useLocalStorage<BillInputs>("billDetails", {
    foodSubtotal: 0,
    serviceFees: 0,
    totalDiscount: 0,
    paidBy: "",
  });
  const [lastUpdated, setLastUpdated] = useLocalStorage<string | null>("lastUpdated", null);
  const [predefinedMemberNames, setPredefinedMemberNames] = useLocalStorage<string[]>("predefinedMemberNames", ["Alice", "Bob", "Charlie", "David", "Eve"]);
  const [addingNewMemberInputState, setAddingNewMemberInputState] = useState<{ [id: string]: string }>({});
  const [editingOldMemberName, setEditingOldMemberName] = useState<string | null>(null);
  const [qrCodeList, setQrCodeList] = useLocalStorage<QRCodeItem[]>("qrCodeList", []); // Thêm khai báo state
  const [selectedQRType, setSelectedQRType] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- CÁC GIÁ TRỊ TỰ ĐỘNG TÍNH TOÁN ---
  const totalPaid = bill.foodSubtotal + bill.serviceFees - bill.totalDiscount;
  const finalFoodTotal = totalPaid - bill.serviceFees;
  const totalOriginalOrder = members.reduce((sum, m) => sum + Number(m.order), 0);
  const perHeadServiceFee = members.length > 0 ? bill.serviceFees / members.length : 0;
  const totalMemberFoodOrders = members.reduce((sum, m) => sum + m.order, 0);

  const calculateShare = useCallback((memberOrder: number) => {
    const ratio = totalOriginalOrder > 0 ? memberOrder / totalOriginalOrder : 0;
    const foodShare = finalFoodTotal * ratio;
    const total = foodShare + perHeadServiceFee;
    const calculatedPercentage = ratio * 100;
    const finalPercentage = calculatedPercentage > 0 ? calculatedPercentage : 0;
    return {
      foodShare: Math.round(foodShare),
      total: Math.round(total),
      percentage: finalPercentage,
    };
  }, [totalOriginalOrder, finalFoodTotal, perHeadServiceFee]);

  const totalReceived = members.reduce((sum, member) => {
    if (member.hasPaid) {
      const { total } = calculateShare(member.order);
      return sum + total;
    }
    return sum;
  }, 0);

  // --- useEffect để cập nhật thời gian lưu ---
  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleString());
    };
    updateTime();
  }, [members, bill, qrCodeList, setLastUpdated]);

  // --- HÀM XỬ LÝ ---
  const updateBill = (key: keyof BillInputs, value: string) => {
    const newValue = (key === "foodSubtotal" || key === "serviceFees" || key === "totalDiscount")
      ? Number(value) || 0
      : value;
    setBill({ ...bill, [key]: newValue });
  };

  const updateMember = (idToUpdate: string, key: keyof Member, value: string | number | boolean) => {
    setMembers((prevMembers: Member[]) => prevMembers.map((member: Member) => {
      if (member.id === idToUpdate) {
        if (key === "order") {
          const newOrder = Number(value);
          const currentTotalOrdersExcludingThis = totalMemberFoodOrders - member.order;
          if (newOrder < 0) {
            alert("Số tiền món gốc không thể là số âm.");
            return member;
          }
          if (bill.foodSubtotal > 0 && currentTotalOrdersExcludingThis + newOrder > bill.foodSubtotal) {
            alert(`Tổng tiền món gốc của các thành viên không thể vượt quá ${bill.foodSubtotal.toLocaleString()}đ (Tổng tiền món ban đầu của hóa đơn).`);
            return member;
          }
        }
        return { ...member, [key]: value };
      }
      return member;
    }));
  };

  const addMemberRow = () => {
    const newMemberId = Date.now().toString();
    setMembers([...members, { id: newMemberId, name: "", order: 0, hasPaid: false }]);
  };

  const removeMember = (idToRemove: string) => {
    setMembers(members.filter((m) => m.id !== idToRemove));
    setAddingNewMemberInputState(prevState => {
      const newState = { ...prevState };
      delete newState[idToRemove];
      return newState;
    });
  };

  const deleteBillData = () => {
    setBill({ foodSubtotal: 0, serviceFees: 0, totalDiscount: 0, paidBy: "" });
    setLastUpdated(null);
    setMembers([]);
    setQrCodeList([]);
  };

  const handleStartDeleteCountdown = () => {
    setIsDeleting(true);
    setCountdown(5);
    if (deleteTimerRef.current) clearInterval(deleteTimerRef.current);
    deleteTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(deleteTimerRef.current!);
          deleteBillData();
          setIsDeleting(false);
          setIsConfirmingDelete(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelDelete = () => {
    if (deleteTimerRef.current) {
      clearInterval(deleteTimerRef.current);
    }
    setIsDeleting(false);
    setCountdown(5);
    setIsConfirmingDelete(false);
  };

  const handleSaveNewMemberName = (memberId: string) => {
    const trimmedName = addingNewMemberInputState[memberId]?.trim();
    if (!trimmedName) {
      alert("Tên thành viên không được để trống!");
      return;
    }
    const isNameInCurrentMembers = members.some(m => m.name.toLowerCase() === trimmedName.toLowerCase() && m.id !== memberId);
    if (isNameInCurrentMembers) {
      alert("Thành viên đã tồn tại trong danh sách!");
      return;
    }
    setMembers((prevMembers: Member[]) => prevMembers.map((m: Member) =>
      m.id === memberId ? { ...m, name: trimmedName } : m
    ));
    setPredefinedMemberNames((prevNames: string[]) => {
      let updatedNames = new Set(prevNames);
      if (editingOldMemberName && editingOldMemberName !== trimmedName) {
        updatedNames.delete(editingOldMemberName);
      }
      if (!updatedNames.has(trimmedName)) {
        updatedNames.add(trimmedName);
      }
      return Array.from(updatedNames).sort();
    });
    setAddingNewMemberInputState(prevState => {
      const newState = { ...prevState };
      delete newState[memberId];
      return newState;
    });
    setEditingOldMemberName(null);
  };

  const handleCancelAddNewMemberName = (memberId: string) => {
    if (members.find(m => m.id === memberId && m.name === "")) {
      removeMember(memberId);
    } else if (editingOldMemberName) {
      updateMember(memberId, "name", editingOldMemberName);
    }
    setAddingNewMemberInputState(prevState => {
      const newState = { ...prevState };
      delete newState[memberId];
      return newState;
    });
    setEditingOldMemberName(null);
  };

  const getAvailableMemberNames = (currentMemberId: string) => {
    const usedNamesInTable = new Set(members.filter(m => m.id !== currentMemberId && m.name !== "").map(m => m.name));
    return predefinedMemberNames.filter(name => !usedNamesInTable.has(name));
  };

  const handleFileSelect = (file: File) => {
    if (!selectedQRType) {
      alert("Vui lòng chọn loại QR trước khi tải ảnh!");
      return;
    }
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newQR: QRCodeItem = {
            id: Date.now().toString(),
            type: selectedQRType,
            imageData: e.target.result as string,
          };
          setQrCodeList((prevList: QRCodeItem[]) => [...prevList, newQR]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const removeQR = (idToRemove: string) => {
    setQrCodeList((prevList: QRCodeItem[]) => prevList.filter((qr: QRCodeItem) => qr.id !== idToRemove));
  };

  // --- GIAO DIỆN ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-4 md:p-8 font-sans">
      <Helmet>
        <title>ShareBill - Chia hóa đơn dễ dàng</title>
        <meta name="description" content="ShareBill giúp bạn chia hóa đơn công bằng dựa trên món ăn mỗi người gọi và phí dịch vụ, hỗ trợ thanh toán qua QR code." />
        <meta name="keywords" content="chia hóa đơn, tính tiền, chia tiền nhóm, QR code, thanh toán, quản lý hóa đơn" />
        <meta name="author" content="TuanLee" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="ShareBill - Chia hóa đơn dễ dàng" />
        <meta property="og:description" content="Chia sẻ chi phí hóa đơn một cách công bằng và dễ dàng với ShareBill. Hỗ trợ nhập món ăn, phí dịch vụ, và lưu mã QR thanh toán." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://sharebill.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ShareBill - Chia hóa đơn dễ dàng" />
        <meta name="twitter:description" content="Chia hóa đơn công bằng và quản lý thanh toán dễ dàng với ShareBill. Hỗ trợ QR code và tính toán tự động." />
        <meta name="twitter:image" content="/og-image.png" />
      </Helmet>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cột chính (Hóa đơn và Thành viên) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm card">
            <CardHeader>
              <CardTitle>1. Hóa Đơn</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Tổng tiền món ban đầu</label>
                <Input
                  type="number"
                  placeholder="ví dụ: 500000"
                  value={bill.foodSubtotal || ''}
                  onChange={(e) => updateBill("foodSubtotal", e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Tổng phí dịch vụ (ship, v.v.)</label>
                <Input
                  type="number"
                  placeholder="ví dụ: 30000"
                  value={bill.serviceFees || ''}
                  onChange={(e) => updateBill("serviceFees", e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Tổng giảm giá</label>
                <Input
                  type="number"
                  placeholder="ví dụ: 50000"
                  value={bill.totalDiscount || ''}
                  onChange={(e) => updateBill("totalDiscount", e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>2. Thành Viên</CardTitle>
              <Button
                size="sm"
                onClick={addMemberRow}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm người
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white min-w-[65px]">Đã trả</TableHead>
                      <TableHead className="text-white min-w-[150px]">Họ Tên</TableHead>
                      <TableHead className="text-white min-w-[140px]">Tiền món (gốc)</TableHead>
                      <TableHead className="text-white">% Món ăn</TableHead>
                      <TableHead className="text-white">Tiền món (chia)</TableHead>
                      <TableHead className="text-white">Phí dịch vụ</TableHead>
                      <TableHead className="text-white font-bold">Tổng Trả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => {
                      const { foodShare, total, percentage } = calculateShare(member.order);
                      const isAddingNameForThisRow = addingNewMemberInputState[member.id] !== undefined;
                      const availableNamesForThisRow = getAvailableMemberNames(member.id);

                      return (
                        <TableRow key={member.id} className={`border-white/10 transition-all ${member.hasPaid ? 'text-yellow-500 line-through' : ''}`}>
                          <TableCell>
                            <Checkbox
                              checked={member.hasPaid}
                              onCheckedChange={(checked) => updateMember(member.id, 'hasPaid', checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            {isAddingNameForThisRow ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  placeholder="Nhập tên mới"
                                  value={addingNewMemberInputState[member.id] || ''}
                                  onChange={(e) => setAddingNewMemberInputState(prevState => ({
                                    ...prevState,
                                    [member.id]: e.target.value
                                  }))}
                                  className="w-full bg-white/10 text-white border-white/20"
                                  autoFocus
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveNewMemberName(member.id);
                                    }
                                  }}
                                />
                                <Button size="sm" onClick={() => handleSaveNewMemberName(member.id)} className="bg-green-500 hover:bg-green-600 text-white">Lưu</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleCancelAddNewMemberName(member.id)} className="text-gray-400 hover:text-white">Hủy</Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={member.name}
                                  onValueChange={(value) => {
                                    if (value === "add_new_member") {
                                      setAddingNewMemberInputState(prevState => ({
                                        ...prevState,
                                        [member.id]: ""
                                      }));
                                      setEditingOldMemberName(null);
                                    } else if (value.startsWith("edit_member_")) {
                                      const originalName = members.find(m => m.id === member.id)?.name || "";
                                      setAddingNewMemberInputState(prevState => ({
                                        ...prevState,
                                        [member.id]: originalName
                                      }));
                                      setEditingOldMemberName(originalName);
                                    } else if (value.startsWith("delete_member_")) {
                                      setPredefinedMemberNames(prevNames => prevNames.filter(name => name !== member.name));
                                      updateMember(member.id, "name", "");
                                    } else {
                                      updateMember(member.id, "name", value);
                                      setAddingNewMemberInputState(prevState => {
                                        const newState = { ...prevState };
                                        delete newState[member.id];
                                        return newState;
                                      });
                                      setEditingOldMemberName(null);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/20">
                                    <SelectValue>
                                      <span className="truncate w-full block">
                                        {member.name || "Chọn hoặc nhập tên"}
                                      </span>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                                    <SelectItem value="add_new_member" className="text-blue-400 font-bold cursor-pointer hover:bg-gray-700">
                                      + Thêm thành viên mới
                                    </SelectItem>
                                    {availableNamesForThisRow.map((name) => (
                                      <SelectItem
                                        key={name}
                                        value={name}
                                        className="hover:bg-gray-700 cursor-pointer"
                                      >
                                        {name}
                                      </SelectItem>
                                    ))}
                                    {member.name && predefinedMemberNames.includes(member.name) && (
                                      <>
                                        <hr className="border-gray-700 my-1" />
                                        <SelectItem
                                          value={`edit_member_${member.id}`}
                                          className="text-yellow-400 hover:bg-gray-700 cursor-pointer"
                                        >
                                          Sửa tên "{member.name}"
                                        </SelectItem>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <SelectItem value={`delete_member_${member.id}`} className="text-red-400 hover:bg-gray-700 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                              Xóa "{member.name}" khỏi danh sách
                                            </SelectItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-red-400">Xác nhận xóa thành viên "{member.name}"?</AlertDialogTitle>
                                              <AlertDialogDescription className="text-gray-300">
                                                Thao tác này sẽ xóa thành viên này khỏi danh sách gợi ý và cả khỏi dòng hiện tại nếu chưa chọn tên khác.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white">Hủy</AlertDialogCancel>
                                              <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => {
                                                  setPredefinedMemberNames(prevNames => prevNames.filter(name => name !== member.name));
                                                  updateMember(member.id, "name", "");
                                                }}
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
                                <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)} className="shrink-0" data-remove-member="true">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="Tiền món gốc"
                              value={member.order || ''}
                              onChange={(e) => updateMember(member.id, "order", Number(e.target.value))}
                              className="bg-white/10 text-white border-white/20"
                            />
                          </TableCell>
                          <TableCell className="text-gray-400">{percentage.toFixed(1)}%</TableCell>
                          <TableCell>{foodShare.toLocaleString()}đ</TableCell>
                          {index === 0 && (
                            <TableCell rowSpan={members.length} className="text-center align-middle bg-white/10">
                              <span className="font-bold text-lg">
                                {Math.round(perHeadServiceFee).toLocaleString()}đ
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="font-bold text-lg">{total.toLocaleString()}đ</TableCell>
                        </TableRow>
                      );
                    })}
                    {members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                          Chưa có thành viên nào. Hãy thêm một người!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột Phải (Tóm tắt và Thanh toán) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm sticky top-8 card">
            <CardHeader>
              <CardTitle>3. Tóm Tắt & Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Người thanh toán</label>
                <Input
                  placeholder="Tên người cầm bill"
                  value={bill.paidBy}
                  onChange={(e) => updateBill("paidBy", e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                />
              </div>

              <hr className="border-white/10 my-4" />
              <div className="space-y-2 text-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tổng đã nhận:</span>
                  <span className="font-bold text-green-400">{totalReceived.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center text-2xl">
                  <span className="font-semibold">Tổng cần trả:</span>
                  <span className="font-extrabold text-cyan-400">{totalPaid.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span className="text-gray-400">Tổng tiền món gốc của thành viên:</span>
                  <span className={`font-bold ${totalMemberFoodOrders > bill.foodSubtotal ? 'text-red-400' : 'text-gray-400'}`}>
                    {totalMemberFoodOrders.toLocaleString()}đ
                  </span>
                </div>
                {lastUpdated && (
                  <div className="text-sm text-gray-400 text-right mt-2">
                    Cập nhật lần cuối: {lastUpdated}
                  </div>
                )}
              </div>

              <hr className="border-white/10 my-4" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Chọn loại QR để tải lên</label>
                <div className="flex gap-2">
                  <Select value={selectedQRType} onValueChange={setSelectedQRType}>
                    <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
                      <SelectValue placeholder="Chọn loại QR" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="Ngân hàng">Ngân hàng</SelectItem>
                      <SelectItem value="Momo">Momo</SelectItem>
                      <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                      <SelectItem value="ViettelPay">ViettelPay</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={!selectedQRType} className="bg-green-500 hover:bg-green-600 shrink-0">
                    <UploadCloud className="h-4 w-4" />
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div
                  className="p-2 rounded-md border border-gray-700 bg-white/5"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {qrCodeList.length > 0 ? (
                    <div className={`grid gap-4 ${qrCodeList.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {qrCodeList.map((qr: QRCodeItem) => (
                        <div key={qr.id} className="relative group overflow-hidden rounded-md flex flex-col items-center justify-center p-2 border border-gray-600">
                          <span className="text-xs text-gray-400 absolute top-1 left-2 bg-gray-900 px-1 py-0.5 rounded-sm">{qr.type}</span>
                          <img src={qr.imageData} alt={`${qr.type} QR Code`} className="object-contain max-h-[150px] max-w-full rounded-md" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600"
                            onClick={() => removeQR(qr.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Kéo và thả ảnh QR vào đây hoặc nhấn nút để tải lên
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-white/10 my-4" />
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                  onClick={() => setShowExplanation(true)}
                >
                  <HelpCircle className="h-5 w-5" />
                  Giải thích cách tính
                </Button>
                <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa dữ liệu Bill cũ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">Xác nhận xóa Bill?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        {isDeleting ? `Đang xóa bill của bạn... (${countdown}s còn lại)` : "Hành động này sẽ xóa toàn bộ thông tin bill (tiền món, phí dịch vụ, giảm giá) và reset số tiền món của thành viên. Bạn có chắc muốn tiếp tục?"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="bg-gray-600 hover:bg-gray-700 text-white hover:text-white"
                        onClick={handleCancelDelete}
                      >
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStartDeleteCountdown();
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? `Đang xóa (${countdown}s)` : "Xác nhận Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AlertDialog cho phần giải thích cách dùng */}
      <AlertDialog open={showExplanation} onOpenChange={setShowExplanation}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-[90vw] max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-400">Cách ứng dụng chia tiền hóa đơn</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-4 text-left">
              <p>
                Ứng dụng này giúp bạn chia sẻ chi phí hóa đơn một cách công bằng dựa trên
                <strong> Tiền món (gốc) </strong> mà mỗi người đã gọi và
                <strong> Tổng phí dịch vụ </strong> được chia đều cho tất cả thành viên.
              </p>
              <div>
                <h3 className="font-bold text-white text-md mb-1">Cơ chế tính toán:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Tiền món (gốc):</strong> Là số tiền món ăn riêng của mỗi người. Bạn cần nhập đúng số tiền món mình đã gọi.
                    <br />
                    <em>Ví dụ: Nhóm có 3 người. Tổng tiền món là 600.000đ. Bạn gọi món hết 180.000đ, thì phần của bạn chiếm 30% tổng tiền món.</em>
                  </li>
                  <li>
                    <strong>Tổng tiền món ăn cần chia:</strong> Là tổng tiền món trên hóa đơn sau khi đã trừ đi các khoản giảm giá.
                    <br />
                    <em>Ví dụ: Tổng món là 600.000đ, được giảm giá 60.000đ → Còn lại 540.000đ cần chia.</em>
                  </li>
                  <li>
                    <strong>Tiền món (chia):</strong> Là phần bạn thực sự phải trả, tính theo tỉ lệ phần ăn gốc bạn đã gọi so với tổng món.
                    <br />
                    <em>Ví dụ: Phần của bạn chiếm 30%, thì bạn sẽ trả 30% của 540.000đ → tức 162.000đ.</em>
                  </li>
                  <li>
                    <strong>Phí dịch vụ:</strong> Là các khoản phí như phí giao hàng, phụ thu,... được chia đều cho tất cả thành viên.
                    <br />
                    <em>Ví dụ: Phí ship là 30.000đ, nhóm có 3 người → mỗi người trả 10.000đ.</em>
                  </li>
                  <li>
                    <strong>Tổng Trả:</strong> Là tổng số tiền bạn phải trả, gồm Tiền món (chia) + Phí dịch vụ.
                    <br />
                    <em>Ví dụ: Tiền món của bạn là 162.000đ, phí dịch vụ là 10.000đ → Tổng bạn cần trả là 172.000đ.</em>
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                <strong><ins>Lưu ý quan trọng:</ins></strong> Tổng
                <strong> Tiền món (gốc) </strong> của tất cả thành viên
                <strong> không được lớn hơn </strong>
                <strong> Tổng tiền món ban đầu </strong> của hóa đơn.
                Nếu tổng bạn nhập nhỏ hơn, ứng dụng sẽ tự động chia phần còn thiếu theo tỉ lệ đã có.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowExplanation(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
              Đã hiểu!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}