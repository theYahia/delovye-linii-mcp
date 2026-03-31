# delovye-linii-mcp

MCP-сервер для API Деловых Линий (Dellin) — расчёт стоимости, справочник городов и терминалов, создание заказов, отслеживание грузов.

[![npm](https://img.shields.io/npm/v/@theyahia/delovye-linii-mcp)](https://www.npmjs.com/package/@theyahia/delovye-linii-mcp)
[![CI](https://github.com/theYahia/delovye-linii-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/delovye-linii-mcp/actions)

## Возможности (6 инструментов)

| Инструмент | Описание |
|---|---|
| `calculate` | Расчёт стоимости и сроков доставки |
| `get_cities` | Поиск городов в справочнике |
| `track` | Отслеживание заказа по номеру накладной |
| `get_terminals` | Поиск терминалов в городе |
| `create_order` | Создание заказа на грузоперевозку |
| `get_order_history` | Получение истории заказов |

## Быстрый старт

### Claude Desktop / Cursor (stdio)

```json
{
  "mcpServers": {
    "dellin": {
      "command": "npx",
      "args": ["-y", "@theyahia/delovye-linii-mcp"],
      "env": {
        "DELLIN_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

### Streamable HTTP

```bash
DELLIN_API_KEY=<YOUR_API_KEY> npx @theyahia/delovye-linii-mcp --http --port=3001
```

Эндпоинты:
- `POST /mcp` — MCP Streamable HTTP
- `GET /health` — Health check

### Smithery

[![smithery badge](https://smithery.ai/badge/@theyahia/delovye-linii-mcp)](https://smithery.ai/server/@theyahia/delovye-linii-mcp)

Установка через Smithery:

```bash
npx -y @smithery/cli install @theyahia/delovye-linii-mcp --client claude
```

## Переменные окружения

| Переменная | Обязательная | Описание |
|---|---|---|
| `DELLIN_API_KEY` | Да | API-ключ из кабинета разработчика: https://dev.dellin.ru/ |

## Skills (Claude Code)

| Команда | Описание |
|---|---|
| `/skill-calculate <откуда> <куда> <вес>` | Расчёт стоимости грузоперевозки |
| `/skill-track <номер>` | Отследить груз по номеру накладной |
| `/freight <откуда> <куда> <вес>` | Полный цикл: поиск городов + расчёт |

## Разработка

```bash
npm install
npm run build
npm test
npm run dev          # stdio (tsx)
npm run start:http   # HTTP-сервер
```

## Лицензия

MIT
