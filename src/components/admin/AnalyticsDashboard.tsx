/**
 * AnalyticsDashboard.tsx — WooCommerce analytics panel
 *
 * Shows:
 * - Revenue and order count this month (vs last month)
 * - Pending/processing orders count
 * - Recent orders table
 * - Top selling products this month
 */

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock,
  DollarSign,
  Package,
  BarChart2,
  RefreshCw,
  AlertCircle,
  Minus,
  Eye,
  Users,
  MousePointerClick,
  Target,
} from "lucide-react";
import { fetchAnalytics, type AnalyticsData } from "@/lib/admin-api";

// ── Helpers ────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pendiente",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  processing: { label: "Procesando",  color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20" },
  completed:  { label: "Completado",  color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  cancelled:  { label: "Cancelado",   color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20" },
  "on-hold":  { label: "En espera",   color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20" },
  refunded:   { label: "Reembolsado", color: "text-muted-foreground", bg: "bg-muted/30 border-border/30" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "text-muted-foreground", bg: "bg-muted/20 border-border/20" };
  return (
    <span className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function GrowthBadge({ growth }: { growth: number }) {
  if (growth === 0) return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" /> Sin cambios
    </span>
  );
  const positive = growth > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
      {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {positive ? "+" : ""}{growth}% vs mes anterior
    </span>
  );
}

function formatPercent(value: number) {
  return `${Number.isFinite(value) ? value : 0}%`;
}

function eventLabel(event: string) {
  const labels: Record<string, string> = {
    page_view: "Visita",
    product_view: "Producto visto",
    add_to_cart: "Agregado al carrito",
    cart_view: "Carrito",
    checkout_start: "Checkout",
    lead: "Contacto",
  };
  return labels[event] ?? event;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error desconocido";
}

// ── Skeleton ───────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-secondary/60 ${className}`} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card/60 border border-border/30 rounded-xl p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
        <div className="bg-card/60 border border-border/30 rounded-xl p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

interface AnalyticsDashboardProps {
  visible: boolean;
}

export function AnalyticsDashboard({ visible }: AnalyticsDashboardProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
    enabled: visible,
    staleTime: 1000 * 60 * 5,  // 5 min cache
    retry: 1,
  });

  if (!visible) return null;
  if (isLoading) return <AnalyticsSkeleton />;

  if (isError) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive text-sm mb-1">No se pudo cargar analytics</p>
          <p className="text-xs text-muted-foreground mb-3">{getErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="text-xs text-primary hover:underline">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { this_month, revenue_growth, pending_count, recent_orders, top_sellers, site } = data;

  return (
    <div className="space-y-5">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          Analytics · {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-3">
          {dataUpdatedAt > 0 && (
            <span className="text-[10px] text-muted-foreground/40">
              Actualizado {new Date(dataUpdatedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-40"
            title="Actualizar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {site && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Visitas web</p>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.page_views}</p>
              <p className="mt-2 text-xs text-muted-foreground/50">{site.today_page_views} hoy · últimos {site.period_days} días</p>
            </div>

            <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-blue-400/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Visitantes</p>
                <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.unique_visitors}</p>
              <p className="mt-2 text-xs text-muted-foreground/50">{site.today_visitors} hoy · {site.sessions} sesiones</p>
            </div>

            <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-amber-400/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Carritos</p>
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.add_to_cart}</p>
              <p className="mt-2 text-xs text-muted-foreground/50">{site.cart_views} visitas al carrito · {formatPercent(site.cart_rate)}</p>
            </div>

            <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-emerald-400/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Checkout</p>
                <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{site.checkout_starts}</p>
              <p className="mt-2 text-xs text-muted-foreground/50">{formatPercent(site.checkout_rate)} desde carrito · {site.leads} contactos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card/40 border border-border/20 rounded-xl p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5" /> Embudo web
              </h3>

              <div className="space-y-3">
                {[
                  { label: "Visitas", value: site.page_views, color: "bg-primary" },
                  { label: "Productos vistos", value: site.product_views, color: "bg-blue-400" },
                  { label: "Agregados al carrito", value: site.add_to_cart, color: "bg-amber-400" },
                  { label: "Checkout iniciado", value: site.checkout_starts, color: "bg-emerald-400" },
                ].map((item) => {
                  const width = site.page_views > 0 ? Math.max(4, Math.round((item.value / site.page_views) * 100)) : 0;
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-border/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-3">Páginas más vistas</p>
                  <div className="space-y-2">
                    {site.top_pages.length === 0 ? (
                      <p className="text-xs text-muted-foreground/40">Todavía no hay visitas registradas</p>
                    ) : (
                      site.top_pages.map((page) => (
                        <div key={page.path} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-foreground truncate">{page.path}</span>
                          <span className="font-semibold text-primary flex-shrink-0">{page.views}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-3">Últimos eventos</p>
                  <div className="space-y-2">
                    {site.last_events.length === 0 ? (
                      <p className="text-xs text-muted-foreground/40">Sin actividad reciente</p>
                    ) : (
                      site.last_events.slice(0, 5).map((event, index) => (
                        <div key={`${event.created_at}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-foreground truncate">{event.product_name || event.path}</span>
                          <span className="text-muted-foreground/50 flex-shrink-0">{eventLabel(event.event)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/40 border border-border/20 rounded-xl p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" /> Interés por producto
              </h3>

              {site.top_products.length === 0 ? (
                <p className="text-sm text-muted-foreground/40 text-center py-8">Sin productos vistos aún</p>
              ) : (
                <div className="space-y-3">
                  {site.top_products.map((product) => (
                    <div key={product.product_id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">{product.views} vistas</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        <span>{product.add_to_cart} carritos</span>
                        <span>·</span>
                        <span>{product.checkout_starts} checkouts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {site.top_referrers.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border/20 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-3">Referidos</p>
                  {site.top_referrers.map((referrer) => (
                    <div key={referrer.host} className="flex items-center justify-between text-xs">
                      <span className="text-foreground truncate">{referrer.host}</span>
                      <span className="font-semibold text-primary">{referrer.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Revenue */}
        <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Ingresos del mes</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(this_month.revenue)}</p>
          <div className="mt-2">
            <GrowthBadge growth={revenue_growth} />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-blue-400/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pedidos del mes</p>
            <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{this_month.orders}</p>
          <p className="mt-2 text-xs text-muted-foreground/50">
            {data.last_month.orders} el mes anterior
          </p>
        </div>

        {/* Pending */}
        <div className={`bg-card/60 border rounded-xl p-4 transition-colors ${pending_count > 0 ? "border-amber-400/30 hover:border-amber-400/50" : "border-border/30"}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pendientes</p>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${pending_count > 0 ? "bg-amber-400/10" : "bg-muted/20"}`}>
              <Clock className={`w-3.5 h-3.5 ${pending_count > 0 ? "text-amber-400" : "text-muted-foreground/40"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${pending_count > 0 ? "text-amber-400" : "text-foreground"}`}>{pending_count}</p>
          <p className="mt-2 text-xs text-muted-foreground/50">requieren atención</p>
        </div>

        {/* Completed */}
        <div className="bg-card/60 border border-border/30 rounded-xl p-4 hover:border-emerald-400/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Completados</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{this_month.by_status?.completed ?? 0}</p>
          <p className="mt-2 text-xs text-muted-foreground/50">entregados este mes</p>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-card/40 border border-border/20 rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> Pedidos recientes
          </h3>

          {recent_orders.length === 0 ? (
            <p className="text-sm text-muted-foreground/40 text-center py-8">Sin pedidos recientes</p>
          ) : (
            <div className="space-y-2">
              {recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group"
                >
                  {/* Order number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">#{order.id}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {order.customer || "Cliente"}
                    </p>
                    <p className="text-xs text-muted-foreground/50 truncate">
                      {order.items.slice(0, 2).join(", ")}{order.items.length > 2 ? ` +${order.items.length - 2}` : ""}
                    </p>
                  </div>

                  {/* Status + amount */}
                  <div className="flex-shrink-0 text-right space-y-1">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-bold text-primary">{formatCurrency(parseFloat(order.total))}</p>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0 hidden lg:block">
                    <p className="text-xs text-muted-foreground/40">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className="bg-card/40 border border-border/20 rounded-xl p-5">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Más vendidos
          </h3>

          {top_sellers.length === 0 ? (
            <p className="text-sm text-muted-foreground/40 text-center py-8">Sin datos de ventas</p>
          ) : (
            <div className="space-y-3">
              {top_sellers.map((p, i) => (
                <div key={p.product_id ?? i} className="flex items-center gap-3">
                  <span className={`text-lg font-bold font-display ${i === 0 ? "text-primary" : "text-muted-foreground/30"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.round((p.quantity / (top_sellers[0]?.quantity || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                    {p.quantity} u.
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Status breakdown */}
          <div className="mt-6 pt-4 border-t border-border/20 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/50 mb-3">Por estado</p>
            {Object.entries(this_month.by_status).map(([status, count]) =>
              count > 0 ? (
                <div key={status} className="flex items-center justify-between text-xs">
                  <StatusBadge status={status} />
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
