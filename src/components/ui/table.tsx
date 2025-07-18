import React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full caption-bottom text-sm ${className}`} {...props} />;
}

export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`[&_tr]:border-b-0 ${className}`} {...props} />;
}

export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
}

export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-b border-white/10 transition-colors hover:bg-white/5 ${className}`} {...props} />;
}

export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`h-12 px-3 text-left align-middle font-medium text-gray-300 ${className}`} {...props} />;
}

export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-3 align-middle ${className}`} {...props} />;
}