/**
 * src/lib/format.ts — Shared formatting utilities
 *
 * Single source of truth for price formatting across the entire app.
 * WooCommerce Store API returns prices in minor units (e.g. 8900000 for $89,000 with minor_unit=2).
 * BUT some WC configs return ARS prices already in pesos with minor_unit=2 (common bug in LATAM setups).
 * We detect this by checking if the raw price is already a "reasonable" amount.
 */

import type { WcProduct } from "./api";

export const formatPrice = (prices: WcProduct["prices"]): string => {
  const raw = parseInt(prices.price, 10);
  const minorUnit = prices.currency_minor_unit ?? 0;
  // Only divide if the result would be >= 100 (protects against double-division for ARS)
  const divided = minorUnit > 0 ? raw / Math.pow(10, minorUnit) : raw;
  // If dividing gives < 10, the price was probably already in major units — use raw
  const val = divided < 10 && raw >= 100 ? raw : divided;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: prices.currency_code || "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};
