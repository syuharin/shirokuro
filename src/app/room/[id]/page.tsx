"use client";

import { usePeer } from "@/hooks/usePeer";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, Wifi, Edit3, Check } from "lucide-react";
import { useState } from "react";
import { SliderComponent } from "@/components/SliderComponent";
import { NameInput } from "@/components/NameInput";
import { ParticipantList } from "@/components/ParticipantList";
import { Input } from "@/components/ui/input";

export default function RoomPage() {
  const { id } = useParams();
  const roomId = Array.isArray(id) ? id[0] : id;

  const { 
    participants, myState, updateMyState, 
    topic, labelMin, labelMax, updateTopic, status 
  } = usePeer(roomId, "ゲスト");

  const [copied, setCopied] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState(topic);
  const [tempMin, setTempMin] = useState(labelMin);
  const [tempMax, setTempMax] = useState(labelMax);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveTopic = () => {
    updateTopic(tempTopic, tempMin, tempMax);
    setIsEditingTopic(false);
  };

  if (status === 'connecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-500 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black"></div>
        <p className="font-bold text-lg">P2Pネットワークに接続中...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold p-6 text-center">
        接続に失敗しました。ページを再読み込みしてください。
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-black flex items-center gap-3 text-black">
              <Wifi className={`w-8 h-8 ${status === 'connected' ? 'text-emerald-500' : 'text-amber-500'} animate-pulse`} />
              ルーム: <span className="font-mono text-neutral-400 select-all">{roomId}</span>
            </h1>
          </div>
          <Button variant="default" size="lg" onClick={copyUrl} className="gap-2 bg-black text-white hover:bg-neutral-800 rounded-xl font-bold shadow-md">
            {copied ? "コピーしました！" : "URLを共有する"} <Copy className="w-5 h-5" />
          </Button>
        </div>

        {/* Topic Card */}
        <Card className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="text-xs font-black text-neutral-400 uppercase tracking-widest">今日のお題</div>
              {!isEditingTopic && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { 
                    setTempTopic(topic); 
                    setTempMin(labelMin); 
                    setTempMax(labelMax); 
                    setIsEditingTopic(true); 
                  }} 
                  className="h-8 gap-1 font-bold text-neutral-400 hover:text-black"
                >
                  <Edit3 className="w-4 h-4" /> お題を編集
                </Button>
              )}
            </div>
            
            {isEditingTopic ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400">お題の内容</label>
                  <Input 
                    value={tempTopic} 
                    onChange={(e) => setTempTopic(e.target.value)}
                    className="text-2xl font-black border-2 border-black h-16 rounded-xl"
                    placeholder="お題を入力してください"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400">0 のラベル</label>
                    <Input 
                      value={tempMin} 
                      onChange={(e) => setTempMin(e.target.value)}
                      className="font-bold border-2 border-neutral-200 h-12 rounded-xl"
                      placeholder="例: 下がる、思わない"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400">100 のラベル</label>
                    <Input 
                      value={tempMax} 
                      onChange={(e) => setTempMax(e.target.value)}
                      className="font-bold border-2 border-neutral-200 h-12 rounded-xl"
                      placeholder="例: 上がる、思う"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTopic} className="flex-1 h-14 bg-black text-white font-black rounded-xl text-lg gap-2">
                    <Check className="w-6 h-6" /> 決定して全員に同期
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingTopic(false)} className="h-14 px-8 font-bold rounded-xl border-2 border-neutral-200">
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl md:text-5xl font-black text-black leading-tight break-words">
                  {topic}
                </div>
                <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="text-center">
                    <div className="text-[10px] font-black text-neutral-400">0 の意味</div>
                    <div className="font-black text-neutral-600">{labelMin}</div>
                  </div>
                  <div className="h-px flex-1 bg-neutral-200 mx-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-200 text-[10px] px-2 py-0.5 rounded-full text-white font-black">SCALE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-black text-neutral-400">100 の意味</div>
                    <div className="font-black text-neutral-600">{labelMax}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* My Controls */}
          <Card className="md:col-span-5 bg-white border-neutral-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-neutral-50 border-b border-neutral-100 p-6">
              <CardTitle className="text-xl font-black text-black flex items-center gap-3">
                <span className="w-2 h-6 bg-black rounded-full" />
                あなたの意見
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <NameInput 
                value={myState.name}
                onChange={(val) => updateMyState({ name: val })}
              />
              
              <SliderComponent 
                value={myState.value}
                onChange={(val) => updateMyState({ value: val })}
                labelMin={labelMin}
                labelMax={labelMax}
              />
            </CardContent>
          </Card>

          {/* Participants List */}
          <div className="md:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-lg">
              <ParticipantList 
                myState={myState} 
                participants={participants} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
