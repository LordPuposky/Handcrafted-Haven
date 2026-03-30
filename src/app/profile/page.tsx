import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ORDER_STATUSES = ["pending", "confirmed", "cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

type OrderRow = {
  id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
};

type OrderItemRow = {
  id: string;
  orderId: string;
  title: string;
  quantity: number;
  lineTotal: number;
};

type ProfilePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatOrderMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const selectedStatus: OrderStatus | "all" =
    params.status && isOrderStatus(params.status) ? params.status : "all";

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  let orders: OrderRow[] = [];
  let orderItemsByOrderId = new Map<string, OrderItemRow[]>();

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, total, currency, createdAt")
    .eq("clientId", user.id)
    .order("createdAt", { ascending: false });

  if (!ordersError && ordersData) {
    orders = ordersData as OrderRow[];

    if (orders.length > 0) {
      const orderIds = orders.map((order) => order.id);
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select("id, orderId, title, quantity, lineTotal")
        .in("orderId", orderIds)
        .order("id", { ascending: true });

      if (!orderItemsError && orderItemsData) {
        const grouped = new Map<string, OrderItemRow[]>();

        for (const item of orderItemsData as OrderItemRow[]) {
          const current = grouped.get(item.orderId) ?? [];
          current.push(item);
          grouped.set(item.orderId, current);
        }

        orderItemsByOrderId = grouped;
      }
    }
  }

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  return (
    <section className="section-block profile-shell">
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="profile-name">{name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-body">
        <div className="panel profile-info-panel">
          <h2>Account information</h2>
          <dl className="profile-dl">
            <div>
              <dt>Name</dt>
              <dd>{name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <form action={logout}>
          <button type="submit" className="btn-logout">
            Sign out
          </button>
        </form>
      </div>

      <section className="profile-orders section-block">
        <div className="section-title-row">
          <h2>Your orders</h2>

          <nav className="profile-orders-filters" aria-label="Filter orders by status">
            <Link
              href="/profile"
              className={`profile-filter-chip ${selectedStatus === "all" ? "is-active" : ""}`}
            >
              All
            </Link>
            <Link
              href="/profile?status=pending"
              className={`profile-filter-chip ${selectedStatus === "pending" ? "is-active" : ""}`}
            >
              Pending
            </Link>
            <Link
              href="/profile?status=confirmed"
              className={`profile-filter-chip ${selectedStatus === "confirmed" ? "is-active" : ""}`}
            >
              Confirmed
            </Link>
            <Link
              href="/profile?status=cancelled"
              className={`profile-filter-chip ${selectedStatus === "cancelled" ? "is-active" : ""}`}
            >
              Cancelled
            </Link>
          </nav>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="profile-orders-empty">
            {orders.length === 0
              ? "No orders yet. Your next purchase will appear here."
              : "No orders found for this status."}
          </p>
        ) : (
          <div className="profile-orders-list">
            {filteredOrders.map((order) => {
              const orderItems = orderItemsByOrderId.get(order.id) ?? [];

              return (
                <article key={order.id} className="panel profile-order-card">
                  <div className="profile-order-top">
                    <p className="profile-order-id">
                      Order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                    </p>
                    <p className={`profile-order-status is-${order.status}`}>
                      {order.status}
                    </p>
                  </div>

                  <p className="profile-order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <div className="profile-order-items">
                    {orderItems.map((item) => (
                      <p key={item.id} className="profile-order-item-row">
                        <span>
                          {item.title} x{item.quantity}
                        </span>
                        <strong>{formatOrderMoney(item.lineTotal, order.currency)}</strong>
                      </p>
                    ))}
                  </div>

                  <p className="profile-order-total">
                    <span>Total</span>
                    <strong>{formatOrderMoney(order.total, order.currency)}</strong>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
