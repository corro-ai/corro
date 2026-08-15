"use client";
import { useState, useCallback } from "react";
import { ChatMessage, Citation } from "@/src/types/chat";
import { askQuestion } from "@/src/lib/api";

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    // 1. Instantly add the user's message to the UI
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setActiveCitation(null); // close panel if it was open

    try {
      // 2. Call our backend API
      const aiMsg = await askQuestion(question, projectId);
      
      // 3. Add AI's response to the UI
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      // Fallback error message
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I ran into an error while analyzing the evidence.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    messages,
    isLoading,
    activeCitation,
    setActiveCitation,
    sendMessage,
  };
}