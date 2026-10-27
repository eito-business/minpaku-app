import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getListings } from "@/lib/supabase/database/listings";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await getListings();
  const supabase = await createServerClient();
  const { data: images } = await supabase
    .from("listing_images")
    .select("listing_id, url, order");

  const imageByListingId = new Map<string, string>();
  for (const image of [...(images ?? [])].sort(
    (a, b) => a.order - b.order
  )) {
    if (!imageByListingId.has(image.listing_id)) {
      imageByListingId.set(image.listing_id, image.url);
    }
  }

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-10">
          すべての掲載
        </h1>

        {listings.length === 0 ? (
          <p className="text-slate-600">掲載されている物件はまだありません。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {listings.map((listing) => {
              const imageUrl = imageByListingId.get(listing.id);

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group rounded-xl overflow-hidden"
                >
                  <div className="aspect-video rounded-xl relative overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <Image
                        fill
                        src={imageUrl}
                        alt={listing.title}
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(min-width: 640px) 50vw, 100vw"
                      />
                    ) : null}
                  </div>
                  <div className="pt-4 space-y-1">
                    <span className="text-sm font-medium text-slate-600">
                      {listing.category}
                    </span>
                    <h2 className="font-medium text-slate-900">{listing.title}</h2>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">
                        ￥{listing.price}（1泊）
                      </p>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {listing.location_value}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
