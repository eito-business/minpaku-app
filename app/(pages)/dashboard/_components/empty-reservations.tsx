import { Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
 
type EmptyReservationsProps = {
  type: "upcoming" | "past";
};
 
export default function EmptyReservations({ type }: EmptyReservationsProps) {
  const isUpcoming = type === "upcoming";
 
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <div className="rounded-full bg-slate-100 p-4 mx-auto w-fit mb-4">
            {isUpcoming ? (
              <Calendar className="h-8 w-8 text-slate-400" />
            ) : (
              <Home className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-xl font-medium mb-2">
            {isUpcoming
              ? "予約中の宿泊施設はありません"
              : "過去の宿泊履歴はありません"}
          </h3>
          <p className="text-slate-600 mb-6">
            {isUpcoming
              ? "新しい宿泊施設を探して予約しましょう"
              : "最初の宿泊施設を予約しましょう"}
          </p>
          <Link href="/">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              宿泊施設を探す
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}