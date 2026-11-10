
import { api } from "./api.js";

const arr = (x) => {
  if (Array.isArray(x)) return x;

  for (const value of Object.values(x || {})) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

export const normalize = (x) => ({
  id: x.id ?? x.transaction_id ?? x.transactionId,
  name:
    x.name ??
    x.transaction_name ??
    x.transactionName ??
    "Untitled",
  type: String(
    x.type ??
    x.transaction_type ??
    x.transactionType ??
    "debit"
  ).toLowerCase(),
  category: x.category ?? x.transaction_category ?? "Other",
  date: x.date ?? x.transaction_date ?? x.created_at,
  amount: Number(
    x.amount ?? x.transaction_amount ?? x.sum ?? 0
  ),
  userName: x.user_name ?? x.username ?? x.user?.name ?? ""
});

export async function list() {
  const data = await api("all-transactions", {
    query: {
      limit: 10,
      offset: 0
    }
  });

  return arr(data).map(normalize);
}

export async function totals() {
  const data = await api("credit-debit-totals");
  const rows = arr(data);

  const sum = (type) => {
    const row = rows.find(
      (x) =>
        String(x.type ?? x.transaction_type).toLowerCase() === type
    );

    return Number(
      row?.sum ??
      row?.total ??
      data?.[type] ??
      data?.[`${type}_total`] ??
      0
    );
  };

  return {
    credit: sum("credit"),
    debit: sum("debit")
  };
}

export async function add(value) {
  return api("add-transaction", {
    method: "POST",
    body: value
  });
}

export async function update(value) {
  return api("update-transaction", {
    method: "POST",
    body: value
  });
}

export async function remove(id) {
  return api("delete-transaction", {
    method: "DELETE",
    body: { id }
  });
}

export async function adminList() {
  return list();
}
