"use client";

import { usePeer } from "@/hooks/usePeer";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit3, Check, Info } from "lucide-react";
import { useState } from "react";
import { ParticipantPositionBar } from "@/components/ParticipantPositionBar";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";

export const MESSAGES = {
  CONNECTING: "P2Pネットワークに接続中...",
  ERROR: "接続エラーが発生しました。ページを更新するか、通信環境を確認してください。",
  HOST_MIGRATED: "ホストが交代しました。新しい参加者を待機中です（固定IDの再取得を試行しています）。",
  TOPIC_TITLE: "現在の同期トピック",
  EDIT_BUTTON: "編集する",
  TOPIC_LABEL: "トピックの内容",
  TOPIC_PLACEHOLDER: "例：この機能は必要ですか？",
  MIN_LABEL: "0 のラベル",
  MIN_PLACEHOLDER: "例：全く思わない",
  MAX_LABEL: "100 のラベル",
  MAX_PLACEHOLDER: "例：強くそう思う",
  SAVE_BUTTON: "トピックを更新して全員に同期する",
  CANCEL_BUTTON: "キャンセル",
  DEFAULT_NAME: "名無しさん"
};

export default function RoomPage() {
  const { id } = useParams();
  const roomId = (Array.isArray(id) ? id[0] : id) ?? "";

  const {
    participants, myState, updateMyState,
    topic, labelMin, labelMax, updateTopic, status, hostRole, isMigrating
  } = usePeer(roomId, MESSAGES.DEFAULT_NAME);

  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [tempTopic, setTempTopic] = useState(topic);
  const [tempMin, setTempMin] = useState(labelMin);
  const [tempMax, setTempMax] = useState(labelMax);

  const saveTopic = () => {
    updateTopic(tempTopic, tempMin, tempMax);
    setIsEditingTopic(false);
  };

  if (status === 'connecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-500 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black"></div>
        <p className="font-bold text-lg">{MESSAGES.CONNECTING}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold p-6 text-center">
        {MESSAGES.ERROR}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Unified Header */}
        <Header
          roomId={roomId}
          name={myState.name}
          onNameChange={(val) => updateMyState({ name: val })}
          connectionStatus={status}
        />

        {/* Host Migration Status Banner */}
        {isMigrating && (
          <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <Info className="text-blue-500 w-6 h-6" />
            <p className="text-blue-700 font-bold">
              {MESSAGES.HOST_MIGRATED}
            </p>
          </div>
        )}

        {/* Topic Card (Primary Header Element) */}
        <Card className="bg-white border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="text-xs font-black text-neutral-400 uppercase tracking-widest">{MESSAGES.TOPIC_TITLE}</div>
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
                  <Edit3 className="w-4 h-4" /> {MESSAGES.EDIT_BUTTON}
                </Button>
              )}
            </div>

            {isEditingTopic ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400">{MESSAGES.TOPIC_LABEL}</label>
                  <Input
                    value={tempTopic}
                    onChange={(e) => setTempTopic(e.target.value)}
                    className="text-2xl font-black border-2 border-black h-16 rounded-xl"
                    placeholder={MESSAGES.TOPIC_PLACEHOLDER}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400">{MESSAGES.MIN_LABEL}</label>
                    <Input
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      className="font-bold border-2 border-neutral-200 h-12 rounded-xl"
                      placeholder={MESSAGES.MIN_PLACEHOLDER}   
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400">{MESSAGES.MAX_LABEL}</label>
                    <Input
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      className="font-bold border-2 border-neutral-200 h-12 rounded-xl"
                      placeholder={MESSAGES.MAX_PLACEHOLDER}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveTopic} className="flex-1 h-auto py-4 bg-black text-white font-black rounded-xl text-lg gap-2 leading-tight">
                    <Check className="w-6 h-6 shrink-0" />
                    <span className="text-left">{MESSAGES.SAVE_BUTTON}</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingTopic(false)} className="h-14 sm:h-auto px-8 font-bold rounded-xl border-2 border-neutral-200">
                    {MESSAGES.CANCEL_BUTTON}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl md:text-5xl font-black text-black leading-tight break-words">    
                  {topic}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrated Distribution Bar (Full Width Content) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-lg min-h-[24rem] flex flex-col justify-center gap-4">
          <ParticipantPositionBar
            myState={myState}
            participants={participants}
            value={myState.value}
            onChange={(val) => updateMyState({ value: val }, false)}
            onCommit={(val) => updateMyState({ value: val }, true)}
            labelMin={labelMin}
            labelMax={labelMax}
          />
        </div>

      </div>
    </div>
  );
}
