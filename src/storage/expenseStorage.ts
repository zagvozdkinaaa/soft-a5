import { CATEGORIES, type Expense } from "../domain/expenses";

export const STORAGE_KEY = "expense-tracker.expenses";

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  const expense = value as Partial<Expense>;
  return (
    typeof expense.id === "string" &&
    typeof expense.title === "string" &&
    typeof expense.amount === "number" &&
    Number.isFinite(expense.amount) &&
    expense.amount > 0 &&
    typeof expense.category === "string" &&
    CATEGORIES.includes(expense.category as Expense["category"]) &&
    typeof expense.date === "string"
  );
}

export function loadExpenses(storage: Storage = localStorage): Expense[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isExpense) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(
  expenses: Expense[],
  storage: Storage = localStorage
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // Storage can be unavailable or full; the in-memory UI remains usable.
  }
}
