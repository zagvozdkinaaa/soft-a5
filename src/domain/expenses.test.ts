import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateSummary,
  createExpense,
  filterExpenses,
  validateExpense,
  type Expense,
  type ExpenseInput
} from "./expenses";
import { loadExpenses, saveExpenses, STORAGE_KEY } from "../storage/expenseStorage";

const validInput: ExpenseInput = {
  title: "  Lunch  ",
  amount: 12.5,
  category: "Food",
  date: "2026-11-23"
};

describe("expense domain", () => {
  it("creates an expense with trimmed title and supplied id", () => {
    const expense = createExpense(validInput, "expense-1");
    expect(expense).toEqual({
      id: "expense-1",
      title: "Lunch",
      amount: 12.5,
      category: "Food",
      date: "2026-11-23"
    });
  });

  it("rejects invalid titles", () => {
    expect(validateExpense({ ...validInput, title: "   " })).toBe(false);
  });

  it("rejects non-positive, infinite, and NaN amounts", () => {
    expect(validateExpense({ ...validInput, amount: 0 })).toBe(false);
    expect(validateExpense({ ...validInput, amount: -1 })).toBe(false);
    expect(validateExpense({ ...validInput, amount: Infinity })).toBe(false);
    expect(validateExpense({ ...validInput, amount: NaN })).toBe(false);
  });

  it("rejects invalid categories and date strings", () => {
    expect(validateExpense({ ...validInput, category: "Unknown" as Expense["category"] })).toBe(false);
    expect(validateExpense({ ...validInput, date: "" })).toBe(false);
    expect(validateExpense({ ...validInput, date: "2026-02-30" })).toBe(false);
    expect(validateExpense({ ...validInput, date: "23/11/2026" })).toBe(false);
  });

  it("throws when createExpense receives invalid input", () => {
    expect(() => createExpense({ ...validInput, amount: 0 })).toThrow("Invalid expense");
  });

  it("filters by category and case-insensitive search", () => {
    const expenses: Expense[] = [
      { id: "1", title: "Lunch", amount: 12, category: "Food", date: "2026-11-23" },
      { id: "2", title: "Bus pass", amount: 30, category: "Transport", date: "2026-11-22" }
    ];
    expect(filterExpenses(expenses, "Food")).toHaveLength(1);
    expect(filterExpenses(expenses, "All", "BUS")).toEqual([expenses[1]]);
    expect(filterExpenses(expenses, "Transport", "pass")).toEqual([expenses[1]]);
  });

  it("calculates total, remaining budget, and category totals", () => {
    const expenses: Expense[] = [
      { id: "1", title: "Lunch", amount: 12.5, category: "Food", date: "2026-11-23" },
      { id: "2", title: "Bus", amount: 30, category: "Transport", date: "2026-11-22" },
      { id: "3", title: "Dinner", amount: 20, category: "Food", date: "2026-11-21" }
    ];
    const summary = calculateSummary(expenses, 100);
    expect(summary.total).toBe(62.5);
    expect(summary.remainingBudget).toBe(37.5);
    expect(summary.totalsPerCategory.Food).toBe(32.5);
    expect(summary.totalsPerCategory.Transport).toBe(30);
    expect(summary.totalsPerCategory.Housing).toBe(0);
  });
});

describe("expense storage", () => {
  beforeEach(() => localStorage.clear());

  it("saves and loads valid expenses", () => {
    const expenses = [createExpense(validInput, "expense-1")];
    saveExpenses(expenses);
    expect(loadExpenses()).toEqual(expenses);
  });

  it("returns an empty array for malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadExpenses()).toEqual([]);
  });

  it("returns an empty array for a non-array JSON value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expense: "bad" }));
    expect(loadExpenses()).toEqual([]);
  });

  it("filters out corrupted entries and keeps valid entries", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([createExpense(validInput, "valid"), { id: "bad", title: 42 }])
    );
    expect(loadExpenses()).toHaveLength(1);
  });

  it("handles storage get and set failures safely", () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error("blocked"); }),
      setItem: vi.fn(() => { throw new Error("full"); })
    } as unknown as Storage;
    expect(loadExpenses(storage)).toEqual([]);
    expect(() => saveExpenses([], storage)).not.toThrow();
  });
});
