"use server";

import { revalidatePath } from "next/cache";
import type { ProductReview } from "@/data/marketplace";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

type ReviewFormValues = {
  productId: string;
  author: string;
  rating: string;
  comment: string;
};

export type ReviewFormState =
  | {
      values?: ReviewFormValues;
      errors?: {
        productId?: string[];
        author?: string[];
        rating?: string[];
        comment?: string[];
      };
      message?: string;
      success?: boolean;
      review?: ProductReview;
    }
  | undefined;

function buildReviewValues(formData: FormData): ReviewFormValues {
  return {
    productId: String(formData.get("productId") ?? "").trim(),
    author: String(formData.get("author") ?? "").trim(),
    rating: String(formData.get("rating") ?? "5").trim(),
    comment: String(formData.get("comment") ?? "").trim(),
  };
}

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const values = buildReviewValues(formData);
  const rating = Number(values.rating);

  const errors: NonNullable<ReviewFormState>["errors"] = {};

  if (!values.productId) {
    errors.productId = ["Please choose a product."];
  }
  if (values.author.length < 2) {
    errors.author = ["Please enter your name."];
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = ["Please choose a rating between 1 and 5."];
  }
  if (values.comment.length < 8) {
    errors.comment = ["Please enter a comment with at least 8 characters."];
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const supabase = await getSupabaseServerClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", values.productId)
    .maybeSingle();

  if (productError) {
    return {
      values,
      message: `Could not validate the selected product: ${productError.message}`,
    };
  }

  if (!product) {
    return {
      values,
      errors: { productId: ["Please choose a valid product."] },
    };
  }

  const newReview: ProductReview = {
    id: `r-${crypto.randomUUID()}`,
    productId: values.productId,
    author: values.author,
    rating,
    comment: values.comment,
  };

  let insertError: { message: string } | null = null;

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("reviews").insert(newReview);
    insertError = error;
  } catch (error) {
    console.error("Failed to insert review with Supabase admin client; falling back to server client.", {
      productId: values.productId,
      error,
    });
    const { error: fallbackError } = await supabase.from("reviews").insert(newReview);
    insertError = fallbackError;
  }

  if (insertError) {
    return {
      values,
      message: `Could not save your review: ${insertError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${values.productId}`);
  revalidatePath("/reviews");

  return {
    success: true,
    message: "Review submitted successfully.",
    review: newReview,
  };
}
