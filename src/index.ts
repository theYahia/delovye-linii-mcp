#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { calculateSchema, handleCalculate } from "./tools/calculate.js";
import { getCitiesSchema, handleGetCities } from "./tools/cities.js";
import { trackSchema, handleTrack } from "./tools/tracking.js";

const server = new McpServer({ name: "delovye-linii-mcp", version: "1.0.0" });

server.tool("calculate", "Расчёт стоимости и сроков доставки Деловыми Линиями.", calculateSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCalculate(params) }] }));

server.tool("get_cities", "Поиск городов в справочнике Деловых Линий.", getCitiesSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCities(params) }] }));

server.tool("track", "Отслеживание заказа Деловых Линий по номеру накладной.", trackSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleTrack(params) }] }));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[delovye-linii-mcp] Сервер запущен. 3 инструмента.");
}

main().catch((error) => { console.error("[delovye-linii-mcp] Ошибка:", error); process.exit(1); });
