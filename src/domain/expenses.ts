export const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Other"
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
}

export type ExpenseInput = Omit<Expense, "id">;

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateExpense(expense: ExpenseInput): boolean {
  return (
    expense.title.trim().length > 0 &&
    Number.isFinite(expense.amount) &&
    expense.amount > 0 &&
    CATEGORIES.includes(expense.category) &&
    typeof expense.date === "string" &&
    isValidDate(expense.date)
  );
}

export function createExpense(input: ExpenseInput, id?: string): Expense {
  if (!validateExpense(input)) throw new Error("Invalid expense");
  const generatedId =
    id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return { ...input, id: generatedId, title: input.title.trim() };
}

export type CategoryFilter = "All" | Category;

export function filterExpenses(
  expenses: Expense[],
  category: CategoryFilter = "All",
  search = ""
): Expense[] {
  const query = search.trim().toLowerCase();
  return expenses.filter(
    (expense) =>
      (category === "All" || expense.category === category) &&
      (!query ||
        expense.title.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query))
  );
}

export interface ExpenseSummary {
  total: number;
  remainingBudget: number;
  totalsPerCategory: Record<Category, number>;
}

export function calculateSummary(
  expenses: Expense[],
  budget: number
): ExpenseSummary {
  const totalsPerCategory = Object.fromEntries(
    CATEGORIES.map((category) => [category, 0])
  ) as Record<Category, number>;

  const total = expenses.reduce((sum, expense) => {
    totalsPerCategory[expense.category] += expense.amount;
    return sum + expense.amount;
  }, 0);

  return { total, remainingBudget: budget - total, totalsPerCategory };
}
