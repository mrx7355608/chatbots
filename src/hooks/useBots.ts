import { useState, useEffect, useCallback, useRef } from "react";
import type { Bot, CreateBotInput } from "@/types";
import * as botService from "@/services/botService";

export function useBots() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchBots = useCallback(async () => {
    try {
      // Only show loading skeleton on initial fetch
      if (!hasFetched.current) setLoading(true);
      setError(null);
      const data = await botService.getBots();
      setBots(data);
      hasFetched.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const createBot = async (input: CreateBotInput) => {
    const bot = await botService.createBot(input);
    setBots((prev) => [bot, ...prev]);
    return bot;
  };

  const deleteBot = async (botId: string) => {
    await botService.deleteBot(botId);
    setBots((prev) => prev.filter((b) => b.id !== botId));
  };

  const updateBot = async (
    botId: string,
    updates: Partial<Pick<Bot, "name" | "website_url">>
  ) => {
    const updated = await botService.updateBot(botId, updates);
    setBots((prev) => prev.map((b) => (b.id === botId ? updated : b)));
    return updated;
  };

  return { bots, loading, error, fetchBots, createBot, deleteBot, updateBot };
}

export function useBot(botId: string) {
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchBot = useCallback(async () => {
    try {
      // Only show loading skeleton on initial fetch
      if (!hasFetched.current) setLoading(true);
      setError(null);
      const data = await botService.getBot(botId);
      setBot(data);
      hasFetched.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bot");
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    fetchBot();
  }, [fetchBot]);

  return { bot, setBot, loading, error, refetch: fetchBot };
}
