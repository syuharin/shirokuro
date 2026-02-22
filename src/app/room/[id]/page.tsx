"use client";

import { usePeer } from "@/hooks/usePeer";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, Wifi } from "lucide-react";
import { useState } from "react";
import { SliderComponent } from "@/components/SliderComponent";
import { NameInput } from "@/components/NameInput";
import { ParticipantList } from "@/components/ParticipantList";

export default function RoomPage() {
  const { id } = useParams();
  const roomId = Array.isArray(id) ? id[0] : id;

  const { participants, myState, updateMyState, status } = usePeer(roomId, "Anonymous");

  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderChange = (value: number) => {
    updateMyState({ value });
  };

  const handleNameChange = (value: string) => {
    updateMyState({ name: value });
  };

  if (status === 'connecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral-400 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        Connecting to P2P network...
      </div>
    );
  }

  if (status === 'error') {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Connection Failed. Please refresh.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wifi className={`w-6 h-6 ${status === 'connected' ? 'text-green-500' : 'text-yellow-500'}`} />
            Room: <span className="font-mono text-neutral-400">{roomId}</span>
          </h1>
          <Button variant="outline" size="sm" onClick={copyUrl} className="gap-2">
            {copied ? "Copied!" : "Share URL"} <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* My Controls */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>My Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <NameInput 
              value={myState.name}
              onChange={handleNameChange}
            />
            
            <SliderComponent 
              value={myState.value}
              onChange={handleSliderChange}
            />
          </CardContent>
        </Card>

        {/* Participants List */}
        <ParticipantList 
          myState={myState} 
          participants={participants} 
        />

      </div>
    </div>
  );
}
