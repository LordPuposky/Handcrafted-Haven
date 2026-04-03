"use client";

import { useActionState } from "react";
import { updateSellerProfile } from "@/app/actions/seller-profile";
import type { Seller } from "@/data/marketplace";

type SellerProfileFormProps = {
  seller: Seller;
};

export function SellerProfileForm({ seller }: SellerProfileFormProps) {
  const [state, action, pending] = useActionState(updateSellerProfile, undefined);
  const nameValue = state?.values?.name ?? seller.name;
  const locationValue = state?.values?.location ?? seller.location;
  const specialtyValue = state?.values?.specialty ?? seller.specialty;
  const bioValue = state?.values?.bio ?? seller.bio;
  const storyValue = state?.values?.story ?? seller.story;
  const avatarEmojiValue = state?.values?.avatarEmoji ?? seller.avatarEmoji;

  return (
    <form action={action} className="seller-product-form" noValidate>
      <div className="seller-product-note">
        <p>
          These details appear on your <strong>public seller profile</strong> and in the artisan
          directory.
        </p>
        <p>Keep the bio concise, and use the story section to share what makes your studio special.</p>
      </div>

      {state?.message ? (
        <div className="auth-alert" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="seller-product-grid">
        <div className="field">
          <label htmlFor="name">Public seller name</label>
          <input id="name" name="name" type="text" defaultValue={nameValue} required />
          {state?.errors?.name ? <span className="field-error">{state.errors.name[0]}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="avatarEmoji">Profile emoji</label>
          <input
            id="avatarEmoji"
            name="avatarEmoji"
            type="text"
            maxLength={4}
            defaultValue={avatarEmojiValue}
            required
          />
          <span className="field-hint">Suggestions: 🏺 🧵 👜 📒 🌿</span>
          {state?.errors?.avatarEmoji ? (
            <span className="field-error">{state.errors.avatarEmoji[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Ex: Belo Horizonte, MG"
            defaultValue={locationValue}
            required
          />
          {state?.errors?.location ? (
            <span className="field-error">{state.errors.location[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="specialty">Specialty</label>
          <input
            id="specialty"
            name="specialty"
            type="text"
            placeholder="Ex: Artistic ceramics"
            defaultValue={specialtyValue}
            required
          />
          {state?.errors?.specialty ? (
            <span className="field-error">{state.errors.specialty[0]}</span>
          ) : null}
        </div>

        <div className="field seller-product-field-wide">
          <label htmlFor="bio">Short bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            placeholder="Share a short summary of your work and style."
            defaultValue={bioValue}
            required
          />
          {state?.errors?.bio ? <span className="field-error">{state.errors.bio[0]}</span> : null}
        </div>

        <div className="field seller-product-field-wide">
          <label htmlFor="story">Studio story</label>
          <textarea
            id="story"
            name="story"
            rows={6}
            placeholder="Tell buyers about your creative process, materials, and inspiration."
            defaultValue={storyValue}
            required
          />
          {state?.errors?.story ? (
            <span className="field-error">{state.errors.story[0]}</span>
          ) : null}
        </div>
      </div>

      <div className="seller-product-actions">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving profile..." : "Save public profile"}
        </button>
      </div>
    </form>
  );
}
