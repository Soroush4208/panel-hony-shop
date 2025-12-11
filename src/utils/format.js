import dayjs from "dayjs";

export const formatPrice = (value = 0) =>
  Intl.NumberFormat("fa-IR", { style: "currency", currency: "IRR" }).format(value);

export const formatDate = (date) =>
  dayjs(date).locale("fa").format("YYYY/MM/DD HH:mm");

