'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  ShoppingCart,
  Warehouse,
  Truck,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { AppRole } from '@/types/database.types';

interface SidebarProps {
  userRole?: AppRole;
}

export function Sidebar({ userRole = 'ROLE_ADMIN' }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Profile', href: '/company', icon: Building2 },
    { name: 'User Management', href: '/users', icon: Users, roles: ['ROLE_ADMIN'] },
    { name: 'Roles & Authorities', href: '/roles', icon: ShieldCheck, roles: ['ROLE_ADMIN'] },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Product Master', href: '/products', icon: Package },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
    { name: 'Procurement', href: '/procurement', icon: Warehouse },
    { name: 'Logistics', href: '/logistics', icon: Truck },
    { name: 'Export Docs', href: '/export-docs', icon: ShieldCheck },
    { name: 'Finance', href: '/finance', icon: Landmark },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
          <div className="bg-green-600 p-2 rounded-lg text-white font-bold">SF</div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Safaa Agro</h1>
            <span className="text-xs text-slate-400">ERP System v1.0</span>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navigation.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) return null;

            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Safaa Agro Farms (Pvt.) Ltd.
      </div>
    </aside>
  );
}
