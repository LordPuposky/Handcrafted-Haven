"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Product } from "@/data/marketplace";
import { categories } from "@/data/marketplace";
import { requireSeller } from "@/lib/auth/authorization";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const allowedCategories = categories.filter(
  (category): category is Product["category"] => category !== "All"
);

type ProductFormValues = {
  title: string;
  category: string;
  description: string;
  price: string;
  imageEmoji: string;
  featured: boolean;
};

export type ProductFormState =
  | {
      values?: ProductFormValues;
      errors?: {
        title?: string[];
        category?: string[];
        description?: string[];
        price?: string[];
        imageEmoji?: string[];
      };
      message?: string;
    }
  | undefined;

function buildProductValues(formData: FormData): ProductFormValues {
  return {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    imageEmoji: String(formData.get("imageEmoji") ?? "").trim(),
    featured: formData.get("featured") === "on",
  };
}

async function upsertSellerProfile(
  sellerPayload: {
    id: string;
    name: string;
    location: string;
    specialty: string;
    bio: string;
    story: string;
    avatarEmoji: string;
  },
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  let writeError: { message: string } | null = null;

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("sellers").upsert(
      {
        ...sellerPayload,
        avatarEmoji: sellerPayload.avatarEmoji,
      },
      { onConflict: "id" }
    );
    writeError = error;
  } catch (error) {
    console.error("Failed to upsert seller profile with admin client.", error);
    const { error: fallbackError } = await supabase.from("sellers").upsert(
      {
        ...sellerPayload,
        avatarEmoji: sellerPayload.avatarEmoji,
      },
      { onConflict: "id" }
    );
    writeError = fallbackError;
  }

  return writeError;
}

async function insertProduct(
  product: Product,
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  let writeError: { message: string } | null = null;

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("products").insert(product);
    writeError = error;
  } catch (error) {
    console.error("Failed to insert product with admin client.", error);
    const { error: fallbackError } = await supabase.from("products").insert(product);
    writeError = fallbackError;
  }

  return writeError;
}

async function getOwnedProduct(
  productId: string,
  sellerId: string,
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select('id, "sellerId"')
    .eq("id", productId)
    .maybeSingle();

  if (lookupError) {
    return { status: "lookup-error" as const, message: lookupError.message, product: null };
  }

  if (!existingProduct || existingProduct.sellerId !== sellerId) {
    return { status: "unauthorized" as const, message: "Unauthorized product access.", product: null };
  }

  return { status: "ok" as const, message: null, product: existingProduct };
}

async function updateOwnedProduct(
  productId: string,
  sellerId: string,
  product: Omit<Product, "id" | "sellerId">,
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  const ownedProduct = await getOwnedProduct(productId, sellerId, supabase);

  if (ownedProduct.status !== "ok") {
    return ownedProduct.status === "unauthorized"
      ? { status: "unauthorized" as const, message: ownedProduct.message }
      : { status: "edit-error" as const, message: ownedProduct.message ?? "Could not load product." };
  }

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("products")
      .update(product)
      .eq("id", productId)
      .eq("sellerId", sellerId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to update product with admin client.", error);
    const { error: fallbackError } = await supabase
      .from("products")
      .update(product)
      .eq("id", productId)
      .eq("sellerId", sellerId);

    if (fallbackError) {
      return { status: "edit-error" as const, message: fallbackError.message };
    }
  }

  return { status: "updated" as const, message: null };
}

async function deleteOwnedProduct(
  productId: string,
  sellerId: string,
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  const ownedProduct = await getOwnedProduct(productId, sellerId, supabase);

  if (ownedProduct.status === "lookup-error") {
    return { status: "delete-error" as const, message: ownedProduct.message ?? "Could not load product." };
  }

  if (ownedProduct.status === "unauthorized") {
    return { status: "unauthorized" as const, message: ownedProduct.message ?? "Unauthorized product access." };
  }

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("products").delete().eq("id", productId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete product with admin client.", error);
    const { error: fallbackError } = await supabase.from("products").delete().eq("id", productId);

    if (fallbackError) {
      return { status: "delete-error" as const, message: fallbackError.message };
    }
  }

  return { status: "deleted" as const };
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const values = buildProductValues(formData);
  const price = Number(values.price);
  const errors: NonNullable<ProductFormState>["errors"] = {};

  if (values.title.length < 3) {
    errors.title = ["Enter a product name with at least 3 characters."];
  }

  if (!allowedCategories.includes(values.category as Product["category"])) {
    errors.category = ["Choose a valid category."];
  }

  if (values.description.length < 12) {
    errors.description = ["Add a short description with at least 12 characters."];
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.price = ["Enter a valid price greater than zero."];
  }

  if (values.imageEmoji.length === 0) {
    errors.imageEmoji = ["Choose an emoji to represent the product image."];
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const { supabase, user, client, seller } = await requireSeller("/seller/products/new");
  const sellerName =
    client?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Seller";
  const sellerId = seller?.id ?? user.id;

  if (!seller) {
    const sellerError = await upsertSellerProfile(
      {
        id: sellerId,
        name: sellerName,
        location: "Location coming soon",
        specialty: values.category,
        bio: `${sellerName} is a verified artisan on Handcrafted Haven.`,
        story:
          "This seller recently joined Handcrafted Haven and is starting to publish handcrafted creations.",
        avatarEmoji: values.imageEmoji,
      },
      supabase
    );

    if (sellerError) {
      return {
        values,
        message: `Could not prepare the seller profile: ${sellerError.message}`,
      };
    }
  }

  const productId = `p-${crypto.randomUUID()}`;
  const product: Product = {
    id: productId,
    sellerId,
    title: values.title,
    category: values.category as Product["category"],
    description: values.description,
    price,
    imageEmoji: values.imageEmoji,
    featured: values.featured,
  };

  const insertError = await insertProduct(product, supabase);

  if (insertError) {
    return {
      values,
      message: `Could not publish the product: ${insertError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/sellers");
  revalidatePath(`/sellers/${sellerId}`);
  revalidatePath("/profile");

  redirect(`/products/${productId}`);
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const values = buildProductValues(formData);
  const productId = String(formData.get("productId") ?? "").trim();
  const price = Number(values.price);
  const errors: NonNullable<ProductFormState>["errors"] = {};

  if (!productId) {
    return { values, message: "Choose a valid product before editing." };
  }

  if (values.title.length < 3) {
    errors.title = ["Enter a product name with at least 3 characters."];
  }

  if (!allowedCategories.includes(values.category as Product["category"])) {
    errors.category = ["Choose a valid category."];
  }

  if (values.description.length < 12) {
    errors.description = ["Add a short description with at least 12 characters."];
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.price = ["Enter a valid price greater than zero."];
  }

  if (values.imageEmoji.length === 0) {
    errors.imageEmoji = ["Choose an emoji to represent the product image."];
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const { supabase, user, seller } = await requireSeller(`/seller/products/${productId}`);
  const sellerId = seller?.id ?? user.id;
  const result = await updateOwnedProduct(
    productId,
    sellerId,
    {
      title: values.title,
      category: values.category as Product["category"],
      description: values.description,
      price,
      imageEmoji: values.imageEmoji,
      featured: values.featured,
    },
    supabase
  );

  if (result.status === "unauthorized") {
    return { values, message: "You do not have permission to edit this product." };
  }

  if (result.status === "edit-error") {
    return { values, message: `Could not update the product: ${result.message}` };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/sellers");
  revalidatePath(`/sellers/${sellerId}`);
  revalidatePath("/seller");

  redirect(`/seller?status=updated`);
}

export async function deleteProduct(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirect("/seller?status=invalid");
  }

  const { supabase, user, seller } = await requireSeller("/seller");
  const sellerId = seller?.id ?? user.id;
  const result = await deleteOwnedProduct(productId, sellerId, supabase);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/sellers");
  revalidatePath(`/sellers/${sellerId}`);
  revalidatePath("/seller");
  revalidatePath("/profile");

  redirect(`/seller?status=${result.status}`);
}
