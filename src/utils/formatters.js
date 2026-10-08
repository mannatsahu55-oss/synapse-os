export const formatCurrency = (amount) => {
  return `$${Number(amount).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
