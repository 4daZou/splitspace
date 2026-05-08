/**
 * SplitSpace - interfaces/models.ts
 * TypeScript interfaces for all data models.
 */

export interface Roommate {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  moveInDate?: Date | string;
  balance?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SplitAmount {
  roommate: Roommate | string;
  amount: number;
  isPaid: boolean;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Groceries'
  | 'Internet'
  | 'Subscriptions'
  | 'Supplies'
  | 'Other';

export interface Expense {
  _id?: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  dueDate?: Date | string;
  createdBy: Roommate | string;
  splitBetween: (Roommate | string)[];
  splitAmounts: SplitAmount[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface Payment {
  _id?: string;
  roommateId: Roommate | string;
  expenseId: Expense | string;
  amountPaid: number;
  datePaid?: Date | string;
  paymentStatus?: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalExpenses: number;
  totalPaid: number;
  totalUnpaid: number;
  recentExpenses: Expense[];
  roommateBalances: Roommate[];
}
