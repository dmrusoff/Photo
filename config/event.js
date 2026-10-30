/**
 * Central Turnkey Event Configuration
 *
 * Customize your event details directly in this file OR override any field
 * via environment variables in `.env.local` / Vercel Project Settings.
 */
export const eventConfig = {
  // Hero Header & Branding
  tagline:
    process.env.NEXT_PUBLIC_EVENT_TAGLINE || "Celebrate Together",
  title:
    process.env.NEXT_PUBLIC_EVENT_TITLE || "The Evening Gala",
  locationLabel:
    process.env.NEXT_PUBLIC_EVENT_LOCATION_LABEL || "Location",
  location:
    process.env.NEXT_PUBLIC_EVENT_LOCATION || "The Grand Conservatory",
  dateLabel:
    process.env.NEXT_PUBLIC_EVENT_DATE_LABEL || "Date",
  date:
    process.env.NEXT_PUBLIC_EVENT_DATE || "October 24, 2026",
  welcomeMessage:
    process.env.NEXT_PUBLIC_EVENT_MESSAGE ||
    "Thank you for joining us in celebrating this special occasion. Please share the photos and videos you captured during the event.",
  footerText:
    process.env.NEXT_PUBLIC_EVENT_FOOTER ||
    "Shared with ❤️ by our guests",
  faviconEmoji:
    process.env.NEXT_PUBLIC_EVENT_ICON || "📸",

  // Gallery & Upload Settings
  itemsPerPage: Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 24,
  cloudinaryFolder:
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "event-photos",
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
};
