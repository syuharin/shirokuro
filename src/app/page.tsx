"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRoomId } from "@/lib/utils";
import { Users, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const createGroup = () => {
    const roomId = generateRoomId();
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black tracking-tighter mb-2 text-black">Shirokuro</CardTitle>
          <CardDescription className="text-neutral-500 font-medium">
            DB不要・P2P通信で数値をリアルタイム同期
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Feature icon={<Zap className="w-5 h-5 text-amber-500" />} text="爆速リアルタイム同期" />
            <Feature icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />} text="データベース不使用で安心" />
            <Feature icon={<Users className="w-5 h-5 text-sky-500" />} text="ログイン不要ですぐに開始" />
          </div>

          <Button 
            onClick={createGroup} 
            className="w-full py-8 text-xl font-bold bg-black text-white hover:bg-neutral-800 transition-all rounded-xl shadow-lg"
          >
            グループを作成する
          </Button>
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-neutral-400 text-sm font-medium">
        Vercel Native &bull; PeerJS &bull; Next.js
      </footer>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-neutral-100 rounded-xl border border-neutral-200">
      {icon}
      <span className="font-bold text-neutral-700">{text}</span>
    </div>
  );
}
