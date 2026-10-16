import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { featuredListings } from "./_data/listings";
 
// How it works セクションのステップを定義
const howItWorksSteps = [
  {
    id: 1,
    title: "探す",
    description:
      "エリア、日程、予算などの条件から、ぴったりの部屋を見つけましょう",
    icon: "🔍",
  },
  {
    id: 2,
    title: "予約する",
    description:
      "空き状況を確認して予約します。あとは当日を楽しみに待つだけです。",
    icon: "📆",
  },
  {
    id: 3,
    title: "体験する",
    description: "ホストと交流し、思い出に残る宿泊体験を満喫しましょう。",
    icon: "🥁",
  },
];
 
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-8">
                <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
                  人と繋がり
                  <br />
                  <span className="">思い出を作る</span>
                  <br />
                  特別な宿泊体験
                </h1>
                <p className="max-w-[600px] text-lg text-slate-600">
                  地元の魅力を発見。個性的な宿泊先を予約。
                  <br />
                  ホストとつながり、新しい体験を楽しみましょう。
                </p>
                <div className="flex space-x-4">
                  <Button
                    asChild
                    className="rounded-full bg-emerald-500 text-white px-8 py-6 text-lg hover:bg-emerald-600 shadow-sm"
                  >
                    <Link href="/listings">今すぐ始める</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-full bg-white text-emerald-500 border border-emerald-500 px-8 py-6 text-lg hover:bg-emerald-50 shadow-sm"
                  >
                    <Link href="#how-it-works">詳しく見る</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    width={600}
                    height={400}
                    src="/hero.jpg"
                    alt="民泊アプリの宿泊体験"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        その日のうちに予約可能！
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">1泊〜 複数人もOK</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Featured Listings */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-16">
            <h2 className="text-5xl font-bold tracking-tight text-slate-900">
              スペシャルな体験ができる、人気の宿。
            </h2>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredListings.map((listing) => (
              <div
                key={listing.id}
                className="group rounded-xl overflow-hidden"
              >
                <div className="aspect-video rounded-xl relative overflow-hidden transition-all hover:shadow-md">
                  <Image
                    fill
                    src={listing.listing_images[0]?.url}
                    alt={listing.title}
                    className="h-full w-full object-cover border border-slate-100 transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="pt-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      {listing.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900">
                    {listing.title}
                  </h3>
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
              </div>
            ))}
          </div>
 
          <div className="mt-12 text-center">
            <Button
              asChild
              className="rounded-full bg-emerald-500 text-white px-8 py-6 text-lg hover:bg-emerald-600 shadow-sm"
            >
              <Link href="/listings">すべての掲載を見る</Link>
            </Button>
          </div>
        </div>
      </section>
 
      {/* How It Works */}
      <section className="py-24 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">
              民泊アプリ の使い方は簡単です。
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              宿泊したい方も、ホストになりたい方も、簡単3ステップで始められます
            </p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorksSteps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center justify-center text-center aspect-square p-6 space-y-6 rounded-xl bg-white shadow-sm border border-gray-100"
              >
                <div className="rounded-full bg-emerald-50 p-6">
                  <span className="text-5xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
 
          <div className="mt-16 text-center">
            <Button
              asChild
              className="rounded-full bg-emerald-500 text-white px-8 py-6 text-lg hover:bg-emerald-600 shadow-sm"
            >
              <Link href="/listings">今すぐ始める</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}