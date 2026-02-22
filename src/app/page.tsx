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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-neutral-800 border-neutral-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter mb-2">Shirokuro</CardTitle>
          <CardDescription className="text-neutral-400">
            Real-time, database-free P2P synchronization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Feature icon={<Zap className="w-5 h-5 text-yellow-400" />} text="Instant Sync" />
            <Feature icon={<ShieldCheck className="w-5 h-5 text-green-400" />} text="Zero Database" />
            <Feature icon={<Users className="w-5 h-5 text-blue-400" />} text="No Login Required" />
          </div>

          <Button 
            onClick={createGroup} 
            className="w-full py-6 text-lg font-semibold bg-white text-black hover:bg-neutral-200 transition-all"
          >
            Create Group
          </Button>
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-neutral-500 text-sm">
        Vercel Native &bull; PeerJS &bull; Next.js
      </footer>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-neutral-700/50 rounded-lg">
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}
