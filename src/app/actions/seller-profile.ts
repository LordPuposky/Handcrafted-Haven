"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSeller } from "@/lib/auth/authorization";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type SellerProfileFormValues = {
  name: string;
  location: string;
  specialty: string;
  bio: string;
  story: string;
  avatarEmoji: string;
};

export type SellerProfileFormState =
  | {
      values?: SellerProfileFormValues;
      errors?: {
        name?: string[];
        location?: string[];
        specialty?: string[];
        bio?: string[];
        story?: string[];
        avatarEmoji?: string[];
      };
      message?: string;
    }
  | undefined;

function buildSellerProfileValues(formData: FormData): SellerProfileFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    specialty: String(formData.get("specialty") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    story: String(formData.get("story") ?? "").trim(),
    avatarEmoji: String(formData.get("avatarEmoji") ?? "").trim(),
  };
}

async function upsertSellerDirectoryProfile(
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

async function syncClientDisplayProfile(
  clientPayload: {
    id: string;
    name: string;
    avatarEmoji: string;
  },
  supabase: Awaited<ReturnType<typeof requireSeller>>["supabase"]
) {
  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("clients")
      .update({ name: clientPayload.name, avatarEmoji: clientPayload.avatarEmoji })
      .eq("id", clientPayload.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to sync client profile with admin client.", error);
    await supabase
      .from("clients")
      .update({ name: clientPayload.name, avatarEmoji: clientPayload.avatarEmoji })
      .eq("id", clientPayload.id);
  }
}

export async function updateSellerProfile(
  _prevState: SellerProfileFormState,
  formData: FormData
): Promise<SellerProfileFormState> {
  const values = buildSellerProfileValues(formData);
  const errors: NonNullable<SellerProfileFormState>["errors"] = {};

  if (values.name.length < 2) {
    errors.name = ["Enter a public display name with at least 2 characters."];
  }

  if (values.location.length < 2) {
    errors.location = ["Enter a location for your studio."];
  }

  if (values.specialty.length < 2) {
    errors.specialty = ["Describe your specialty in a few words."];
  }

  if (values.bio.length < 12) {
    errors.bio = ["Add a short bio with at least 12 characters."];
  }

  if (values.story.length < 24) {
    errors.story = ["Share a studio story with at least 24 characters."];
  }

  if (values.avatarEmoji.length === 0) {
    errors.avatarEmoji = ["Choose an emoji for your public seller profile."];
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  const { supabase, user } = await requireSeller("/seller/profile");
  const sellerId = user.id;

  const sellerError = await upsertSellerDirectoryProfile(
    {
      id: sellerId,
      name: values.name,
      location: values.location,
      specialty: values.specialty,
      bio: values.bio,
      story: values.story,
      avatarEmoji: values.avatarEmoji,
    },
    supabase
  );

  if (sellerError) {
    return {
      values,
      message: `Could not update your public seller profile: ${sellerError.message}`,
    };
  }

  await syncClientDisplayProfile(
    {
      id: user.id,
      name: values.name,
      avatarEmoji: values.avatarEmoji,
    },
    supabase
  );

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/seller");
  revalidatePath("/seller/profile");
  revalidatePath("/sellers");
  revalidatePath(`/sellers/${sellerId}`);

  redirect("/seller?status=profile-updated");
}
