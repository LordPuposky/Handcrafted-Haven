"use server";

import { getCurrentAuthContext } from "@/lib/auth/authorization";

type CheckoutItemPayload = {
  productId: string;
  quantity: number;
};

type CheckoutFormValues = {
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  notes: string;
};

export type CheckoutFormState =
  | {
      values?: CheckoutFormValues;
      errors?: {
        shippingName?: string[];
        shippingEmail?: string[];
        shippingAddress?: string[];
        shippingCity?: string[];
        shippingState?: string[];
        shippingPostalCode?: string[];
      };
      message?: string;
      success?: boolean;
      orderId?: string;
    }
  | undefined;

function parseItems(rawItems: string) {
  try {
    const parsed = JSON.parse(rawItems) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is CheckoutItemPayload => {
        if (typeof item !== "object" || item === null) {
          return false;
        }

        const candidate = item as Record<string, unknown>;
        return (
          typeof candidate.productId === "string" &&
          typeof candidate.quantity === "number"
        );
      })
      .map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));
  } catch {
    return [];
  }
}

function buildCheckoutValues(formData: FormData): CheckoutFormValues {
  return {
    shippingName: String(formData.get("shippingName") ?? "").trim(),
    shippingEmail: String(formData.get("shippingEmail") ?? "").trim(),
    shippingAddress: String(formData.get("shippingAddress") ?? "").trim(),
    shippingCity: String(formData.get("shippingCity") ?? "").trim(),
    shippingState: String(formData.get("shippingState") ?? "").trim(),
    shippingPostalCode: String(formData.get("shippingPostalCode") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

export async function placeOrder(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const values = buildCheckoutValues(formData);
  const {
    shippingName,
    shippingEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    notes,
  } = values;
  const rawItems = String(formData.get("items") ?? "[]");

  const errors: NonNullable<CheckoutFormState>["errors"] = {};

  if (shippingName.length < 2) {
    errors.shippingName = ["Please enter the recipient name."];
  }
  if (!shippingEmail.includes("@")) {
    errors.shippingEmail = ["Please enter a valid email address."];
  }
  if (shippingAddress.length < 5) {
    errors.shippingAddress = ["Please enter a valid street address."];
  }
  if (shippingCity.length < 2) {
    errors.shippingCity = ["Please enter a valid city."];
  }
  if (shippingState.length < 2) {
    errors.shippingState = ["Please enter a valid state."];
  }
  if (shippingPostalCode.length < 4) {
    errors.shippingPostalCode = ["Please enter a valid postal code."];
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const items = parseItems(rawItems);
  if (items.length === 0) {
    return { values, message: "Your cart is empty or invalid." };
  }

  const { supabase, user, role } = await getCurrentAuthContext();

  if (!user) {
    return { values, message: "Please sign in before checking out." };
  }

  if (role !== "buyer") {
    return {
      values,
      message: "Seller accounts cannot place orders or use checkout.",
    };
  }

  // Ensure the buyer profile exists even if the auth trigger/schema wasn't applied yet.
  const { error: ensureClientError } = await supabase.from("clients").upsert(
    {
      id: user.id,
      name:
        user.user_metadata?.full_name ??
        user.email?.split("@")[0] ??
        shippingName,
      email: user.email ?? shippingEmail,
    },
    { onConflict: "id" }
  );

  if (ensureClientError) {
    return {
      values,
      message: `Could not sync your customer profile: ${ensureClientError.message}`,
    };
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("id, title, price")
    .in("id", productIds);

  if (productsError) {
    return {
      values,
      message: `Could not load products for checkout: ${productsError.message}`,
    };
  }

  const productsById = new Map((dbProducts ?? []).map((product) => [product.id, product]));

  const lineItems = items
    .map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        return null;
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: product.id,
        title: product.title,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (lineItems.length === 0) {
    return {
      values,
      message:
        "No purchasable items were found in your cart. Make sure products exist in the database and your cart items are valid.",
    };
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal >= 300 ? 0 : 18;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const orderId = crypto.randomUUID();

  const { error: orderInsertError } = await supabase.from("orders").insert({
    id: orderId,
    clientId: user.id,
    status: "pending",
    subtotal,
    shipping,
    tax,
    total,
    currency: "BRL",
    shippingName,
    shippingEmail,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPostalCode,
    notes: notes.length > 0 ? notes : null,
  });

  if (orderInsertError) {
    return {
      values,
      message: `Could not save your order: ${orderInsertError.message}`,
    };
  }

  const { error: itemsInsertError } = await supabase.from("order_items").insert(
    lineItems.map((item) => ({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      title: item.title,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }))
  );

  if (itemsInsertError) {
    await supabase.from("orders").delete().eq("id", orderId);

    return {
      values,
      message: `Could not save order items: ${itemsInsertError.message}`,
    };
  }

  return {
    success: true,
    orderId,
    message: "Order placed successfully.",
  };
}
