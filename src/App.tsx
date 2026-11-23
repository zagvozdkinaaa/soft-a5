import { useEffect, useState, type FormEvent } from "react";
import {
  CATEGORIES,
  calculateSummary,
  createExpense,
  filterExpenses,
  type Category,
  type CategoryFilter,
  type Expense,
  type ExpenseInput
} from "./domain/expenses";
import { loadExpenses, saveExpenses } from "./storage/expenseStorage";

const initialForm: ExpenseInput = {
  title: "",
  amount: 0,
  category: "Food",
  date: new Date().toISOString().slice(0, 10)
};

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [form, setForm] = useState<ExpenseInput>(initialForm);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState(1000);
  const [error, setError] = useState("");

  useEffect(() => saveExpenses(expenses), [expenses]);

  function addExpense(event: FormEvent) {
    event.preventDefault();
    try {
      setExpenses((items) => [...items, createExpense(form)]);
      setForm(initialForm);
      setError("");
    } catch {
      setError("Enter a title, positive amount, category, and valid date.");
    }
  }

  const visible = filterExpenses(expenses, category, search);
  const summary = calculateSummary(expenses, budget);

  return (
    <main className="app">
      <h1>Expense Tracker</h1>

      <section className="summary" aria-label="Expense summary">
        <div><span>Total spent</span><strong>{money(summary.total)}</strong></div>
        <label><span>Budget</span>
          <input type="number" min="0" step="1" value={budget}
            onChange={(event) => setBudget(Number(event.target.value) || 0)} />
        </label>
        <div><span>Remaining</span><strong>{money(summary.remainingBudget)}</strong></div>
      </section>

      <section className="category-totals">
        {CATEGORIES.map((item) => (
          <span key={item}>{item}: <strong>{money(summary.totalsPerCategory[item])}</strong></span>
        ))}
      </section>

      <form className="expense-form" onSubmit={addExpense}>
        <input aria-label="Title" placeholder="Expense title" value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <input aria-label="Amount" type="number" min="0.01" step="0.01" placeholder="Amount"
          value={form.amount || ""} onChange={(event) =>
            setForm({ ...form, amount: Number(event.target.value) })} />
        <select aria-label="Category" value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>
          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input aria-label="Date" type="date" value={form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <button type="submit">Add expense</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="filters">
        <input aria-label="Search" placeholder="Search expenses" value={search}
          onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter category" value={category}
          onChange={(event) => setCategory(event.target.value as CategoryFilter)}>
          <option>All</option>
          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <div className="expense-list">
        {visible.map((expense) => (
          <article className="expense" key={expense.id}>
            <div>
              <strong>{expense.title}</strong>
              <small>{expense.category} · {expense.date}</small>
            </div>
            <strong>{money(expense.amount)}</strong>
            <button aria-label={`Delete ${expense.title}`} onClick={() =>
              setExpenses((items) => items.filter((item) => item.id !== expense.id))}
            >Delete</button>
          </article>
        ))}
        {visible.length === 0 && <p className="empty">No expenses to show.</p>}
      </div>
    </main>
  );
}
