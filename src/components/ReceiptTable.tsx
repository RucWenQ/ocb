import type { ReceiptItem } from '../data/receiptData'

interface ReceiptTableProps {
  items: ReceiptItem[]
}

export default function ReceiptTable({ items }: ReceiptTableProps) {
  const showEco = items.some((item) => item.ecoLabel)

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 font-medium">物品</th>
            <th className="px-3 py-2 font-medium">品牌/规格</th>
            <th className="px-3 py-2 font-medium">数量</th>
            <th className="px-3 py-2 font-medium">单价</th>
            <th className="px-3 py-2 font-medium">小计</th>
            {showEco && <th className="px-3 py-2 font-medium">环保标识</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.item} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="px-3 py-2">{item.item}</td>
              <td className="px-3 py-2">{item.brandSpec}</td>
              <td className="px-3 py-2">{item.quantity}</td>
              <td className="px-3 py-2">{item.unitPrice}</td>
              <td className="px-3 py-2">{item.subtotal}</td>
              {showEco && <td className="px-3 py-2">{item.ecoLabel ?? '-'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
