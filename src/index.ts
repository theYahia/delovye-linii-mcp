#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { calculateSchema, handleCalculate } from "./tools/calculate.js";
import { getCitiesSchema, handleGetCities } from "./tools/cities.js";
import { trackSchema, handleTrack } from "./tools/tracking.js";
import { getTerminalsSchema, handleGetTerminals } from "./tools/terminals.js";
import { createOrderSchema, handleCreateOrder } from "./tools/order.js";
import { getOrderHistorySchema, handleGetOrderHistory } from "./tools/order-history.js";

const VERSION = "1.1.0";

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "delovye-linii-mcp", version: VERSION });

  server.tool(
    "calculate",
    "Расчёт стоимости и сроков доставки Деловыми Линиями.",
    calculateSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCalculate(params) }] }),
  );

  server.tool(
    "get_cities",
    "Поиск городов в справочнике Деловых Линий.",
    getCitiesSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetCities(params) }] }),
  );

  server.tool(
    "track",
    "Отслеживание заказа Деловых Линий по номеру накладной.",
    trackSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleTrack(params) }] }),
  );

  server.tool(
    "get_terminals",
    "Поиск терминалов Деловых Линий в указанном городе.",
    getTerminalsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetTerminals(params) }] }),
  );

  server.tool(
    "create_order",
    "Создание заказа на грузоперевозку в Деловых Линиях.",
    createOrderSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateOrder(params) }] }),
  );

  server.tool(
    "get_order_history",
    "Получение истории заказов Деловых Линий.",
    getOrderHistorySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetOrderHistory(params) }] }),
  );

  return server;
}

async function main() {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http");
  const port = parseInt(args.find((a) => a.startsWith("--port="))?.split("=")[1] ?? "3001", 10);

  const server = createMcpServer();

  if (httpMode) {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
    await server.connect(transport);

    const httpServer = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
      } else if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: 6 }));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[delovye-linii-mcp] HTTP-сервер запущен: http://localhost:${port}/mcp`);
      console.error(`[delovye-linii-mcp] Health: http://localhost:${port}/health`);
      console.error(`[delovye-linii-mcp] ${VERSION} — 6 инструментов.`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[delovye-linii-mcp] Сервер запущен (stdio). ${VERSION} — 6 инструментов.`);
  }
}

main().catch((error) => {
  console.error("[delovye-linii-mcp] Ошибка:", error);
  process.exit(1);
});
