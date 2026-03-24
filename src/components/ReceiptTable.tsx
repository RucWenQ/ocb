import type { ReceiptItem } from '../data/receiptData'
import { Fragment } from 'react'

interface ReceiptTableProps {
  items: ReceiptItem[]
  showEcoColumn: boolean
}

export default function ReceiptTable({ items, showEcoColumn }: ReceiptTableProps) {
  let currentCategory = ''

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
            {showEcoColumn && <th className="px-3 py-2 font-medium">备注</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const categoryChanged = item.category !== currentCategory
            currentCategory = item.category

            return (
              <Fragment key={`${item.category}-${item.name}-${index}`}>
                {categoryChanged && (
                  <tr className="bg-slate-50">
                    <td colSpan={showEcoColumn ? 6 : 5} className="px-3 py-2 text-xs font-semibold text-slate-700">
                      【{item.category}】
                    </td>
                  </tr>
                )}
                <tr className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.spec}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{item.unitPrice.toFixed(1)}</td>
                  <td className="px-3 py-2">{item.subtotal}</td>
                  {showEcoColumn && (
                    <td className={`px-3 py-2 ${item.ecoLabel ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}>
                      {item.ecoLabel ?? '—'}
                    </td>
                  )}
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
