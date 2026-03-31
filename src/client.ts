const BASE_URL = "https://api.dellin.ru/v3";
const TIMEOUT = 15_000;

export class DellinClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey ?? process.env.DELLIN_API_KEY ?? "";
    this.baseUrl = baseUrl ?? BASE_URL;
    if (!this.apiKey) {
      throw new Error(
        "Переменная окружения DELLIN_API_KEY обязательна. " +
        "Получите ключ API в личном кабинете Деловых Линий: https://dev.dellin.ru/",
      );
    }
  }

  async post(path: string, body?: Record<string, unknown>): Promise<unknown> {
    const url = `${this.baseUrl}${path}.json`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const payload = { ...body, appkey: this.apiKey };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Деловые Линии HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();

      if (data && typeof data === "object" && "errors" in data) {
        const errData = data as { errors: Array<{ title: string; detail?: string }> };
        if (errData.errors && errData.errors.length > 0) {
          const msgs = errData.errors
            .map((e: { title: string; detail?: string }) => (e.detail ? `${e.title}: ${e.detail}` : e.title))
            .join("; ");
          throw new Error(`Деловые Линии: ${msgs}`);
        }
      }

      return data;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Деловые Линии: таймаут запроса (15 секунд). Попробуйте позже.");
      }
      throw error;
    }
  }
}
