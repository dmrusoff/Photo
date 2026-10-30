import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { eventConfig } from "../../../config/event";

const isCloudinaryConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Curated fallback gallery when running locally without Cloudinary credentials
const DEMO_PHOTOS = [
  {
    id: "demo-1",
    type: "image",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Elena R.",
    createdAt: "2026-10-24T19:30:00Z",
  },
  {
    id: "demo-2",
    type: "image",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Marcus V.",
    createdAt: "2026-10-24T20:12:00Z",
  },
  {
    id: "demo-3",
    type: "image",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Sophia L.",
    createdAt: "2026-10-24T20:45:00Z",
  },
  {
    id: "demo-4",
    type: "image",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Julian K.",
    createdAt: "2026-10-24T21:10:00Z",
  },
  {
    id: "demo-5",
    type: "image",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Claire M.",
    createdAt: "2026-10-24T21:40:00Z",
  },
  {
    id: "demo-6",
    type: "image",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&h=400&q=80",
    fullUrl:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    uploadedBy: "Noah T.",
    createdAt: "2026-10-24T22:05:00Z",
  },
];

export async function GET() {
  if (!isCloudinaryConfigured) {
    return NextResponse.json({
      photos: DEMO_PHOTOS,
      total: DEMO_PHOTOS.length,
      demoMode: true,
    });
  }

  try {
    const safeFolder = eventConfig.cloudinaryFolder.replace(/[^a-zA-Z0-9/_-]/g, "");
    const result = await cloudinary.search
      .expression(`folder:${safeFolder}`)
      .sort_by("created_at", "desc")
      .max_results(500)
      .with_field("context")
      .execute();

    const photos = result.resources.map((resource) => {
      const isVideo = resource.resource_type === "video";

      const thumbnail = cloudinary.url(resource.public_id, {
        resource_type: resource.resource_type,
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        format: isVideo ? "jpg" : undefined,
        fetch_format: "auto",
        secure: true,
      });

      const fullUrl = cloudinary.url(resource.public_id, {
        resource_type: resource.resource_type,
        width: isVideo ? undefined : 1600,
        height: isVideo ? undefined : 1600,
        crop: isVideo ? undefined : "limit",
        quality: "auto",
        format: isVideo ? "mp4" : undefined,
        fetch_format: "auto",
        secure: true,
        transformation: isVideo
          ? [{ streaming_profile: "full_hd", quality: "auto" }]
          : undefined,
      });

      return {
        id: resource.public_id,
        type: isVideo ? "video" : "image",
        url: resource.secure_url,
        thumbnail: thumbnail,
        fullUrl: fullUrl,
        width: resource.width,
        height: resource.height,
        uploadedBy: resource.context?.uploaded_by || "A guest",
        createdAt: resource.created_at,
      };
    });

    return NextResponse.json(
      { photos, total: result.total_count, demoMode: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to load photos" },
      { status: 500 }
    );
  }
}
