"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInView } from "@/hooks/useInView";
import CodeBlock from "./CodeBlock";

const PYTHON_CODE = `import asyncio
import websockets
import json

async def voice_chat():
    uri = "ws://localhost:8000/ws/chat"
    async with websockets.connect(uri) as ws:
        # Send audio chunks from microphone
        async def send_audio(stream):
            async for chunk in stream:
                await ws.send(chunk)

        # Receive responses
        async for message in ws:
            if isinstance(message, bytes):
                # Play audio response
                play_audio(message)
            else:
                data = json.loads(message)
                if data["type"] == "transcript.assistant":
                    print(f"AI: {data['text']}")

asyncio.run(voice_chat())`;

const WEBSOCKET_CODE = `const ws = new WebSocket("ws://localhost:8000/ws/chat");

ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    // Binary: audio response — feed to AudioContext
    event.data.arrayBuffer().then(playAudio);
  } else {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case "transcript.user":
        console.log("You:", msg.text);
        break;
      case "transcript.assistant":
        console.log("AI:", msg.text);
        break;
      case "state.change":
        updateUI(msg.state); // idle|listening|thinking|speaking
        break;
    }
  }
};

// Stream microphone audio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => streamToWebSocket(stream, ws));`;

const REACT_CODE = `import { useVoiceChat } from "@/hooks/useVoiceChat";

export function MyVoiceApp() {
  const {
    state,        // "idle" | "listening" | "thinking" | "speaking"
    transcript,   // { role, text, final }[]
    metrics,      // { asr_ms, ttft_ms, ttffa_ms, tts_ms }
    start,        // Connect & begin recording
    stop,         // End session
    bargeIn,      // Interrupt AI speech
  } = useVoiceChat();

  return (
    <div>
      <p>Status: {state}</p>
      <button onClick={state === "idle" ? start : stop}>
        {state === "idle" ? "Start" : "Stop"}
      </button>
      {transcript.map((entry, i) => (
        <p key={i}>{entry.role}: {entry.text}</p>
      ))}
    </div>
  );
}`;

export default function CodeSection() {
  const { ref, inView } = useInView();

  return (
    <section id="code" className="py-24 relative">
      <div ref={ref} className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="headline text-3xl md:text-5xl lg:text-6xl">
            integrate in minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mt-4">
            connect via websocket. stream audio. get real-time transcripts and metrics.
          </p>
        </div>

        {/* Tabbed code blocks */}
        <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "300ms" }}>
          <Tabs defaultValue="python" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none gap-0 h-auto p-0">
              <TabsTrigger
                value="python"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-mono"
              >
                python
              </TabsTrigger>
              <TabsTrigger
                value="websocket"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-mono"
              >
                websocket
              </TabsTrigger>
              <TabsTrigger
                value="react"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-mono"
              >
                react
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="python">
                <CodeBlock code={PYTHON_CODE} language="python" />
              </TabsContent>
              <TabsContent value="websocket">
                <CodeBlock code={WEBSOCKET_CODE} language="javascript" />
              </TabsContent>
              <TabsContent value="react">
                <CodeBlock code={REACT_CODE} language="javascript" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
