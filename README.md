# Social API

Минимальный backend-сервис для социальной платформы на TypeScript, TypeORM, MariaDB, Swagger, Node.js и Express.js.

Релизован архитектурный подход MVC with service layer. Разделены слои на презентационный, бизнес-логика и данные, чтоб позволяет хоршо масштабироваться и использовать stateless-подход. Сессии не хранятся, а используют JWT. При большой нагрузке возможно горизонтальное масштабирование путем добавления большего количества pods (инстансов).

БД оптимизированна при помощи внешних ключей (id) и индексов (BTree) по запросам с join (author_id, created_at) и order (created_at, id).

Для снижения нагрузки при запросах на получение истории публикаций используется Cursor-based поиск, что подходит для социальных сетей.

## Установка / Запуск

1. Установить зависимости:
    ```bash
    npm install
    ```
2. Настроить `.env` при необходимости.
3. Применить миграции и запустить сервер:
    ```bash
    npm run start:prod
    ```
4. Для разработки:
    ```bash
    npm run start:dev
    ```

## Запуск в Docker

- `docker-compose up` - запуск сервиса
- `docker-compose up --build` - запуск с пересборкой
- `docker-compose down` - остановка контейнеров
- `docker-compose down -v` - остановка с удалением контейнеров

## Скрипты

- `npm run build` — компиляция TypeScript в `dist`
- `npm run start` — запуск скомпилированного приложения
- `npm run start:prod` — запускает миграции, затем сервер
- `npm run start:dev` — запуск в режиме разработки с `nodemon` и `ts-node`

## Переменные окружения

- `PORT` — порт HTTP-сервера (по умолчанию `3000`)
- `DB_HOST` — хост MariaDB (`mariadb`)
- `DB_PORT` — порт MariaDB (`3306`)
- `DB_USER` — пользователь БД (`social`)
- `DB_PASSWORD` — пароль БД (`social`)
- `DB_NAME` — имя базы данных (`social`)
- `JWT_ACCESS_SECRET` — секрет для access token
- `JWT_REFRESH_SECRET` — секрет для refresh token
- `JWT_ACCESS_TTL_SECONDS` — время жизни access token
- `JWT_REFRESH_TTL_SECONDS` — время жизни refresh token
- `LOG_LEVEL` - уровень логгирования (debug|info|warn|error)

## Архитектура

- `src/server.ts` — загрузка БД и запуск сервера
- `src/app.ts` — конфигурация Express, middleware, роуты, swagger
- `src/routes/*` — маршруты API
- `src/controllers/*` — контроллеры HTTP-запросов
- `src/services/*` — бизнес-логика и взаимодействие с БД
- `src/middlewares/*` — авторизация, проверка владельца, валидация, обработка ошибок
- `src/models/entities/*` — TypeORM-сущности
- `src/schemas/*` — `zod`-схемы для валидации запросов

## Документация Swagger

Swagger UI доступен по адресу:

- `http://localhost:<PORT>/api-docs`

## API методы

### Healthcheck

- `GET /health`
- Ответ: `{ ok: true }`

### Auth

#### `POST /api/auth/register`

Регистрация пользователя.

- Body:
    - `email` — строка, email
    - `username` — строка, 2..50 символов
    - `password` — строка, 8..50 символов
- Успех: `201`
- Ответ:
    - `accessToken`
    - `refreshToken`

#### `POST /api/auth/login`

Вход пользователя.

- Body:
    - `email`
    - `password`
- Успех: `200`
- Ответ:
    - `accessToken`
    - `refreshToken`

#### `POST /api/auth/refresh`

Обновление access token.

- Body:
    - `refreshToken`
- Успех: `200`
- Ответ:
    - `accessToken`
    - `refreshToken`

### Posts

#### `GET /api/posts`

Получить список постов.

- Query-параметры:
    - `limit` — число, до `100`, по умолчанию `50`
    - `post_created_at` — `datetime`
    - `post_id` — UUID
- Если используется `post_created_at`, то обязательно также `post_id`.
- Успех: `200`
- Ответ:
    - `items` — массив постов
    - `next` — курсор для следующих данных

#### `GET /api/posts/:id`

Получить пост по идентификатору.

- Path:
    - `id` — UUID
- Успех: `200`
- Ошибка: `404` если пост не найден

#### `POST /api/posts`

Создать пост.

- Требует `Authorization: Bearer <accessToken>`
- Body:
    - `content` — строка, 1..16000 символов
- Успех: `201`
- Ответ: созданный пост

#### `PUT /api/posts/:id`

Обновить собственный пост.

- Требует `Authorization: Bearer <accessToken>`
- Path:
    - `id` — UUID
- Body:
    - `content` — строка, 1..16000 символов
- Успех: `200`
- Ошибки:
    - `401` если неавторизован
    - `404` если пост не найден или не принадлежит пользователю

#### `DELETE /api/posts/:id`

Удалить собственный пост.

- Требует `Authorization: Bearer <accessToken>`
- Path:
    - `id` — UUID
- Успех: `204`
- Ошибки:
    - `401` если неавторизован
    - `404` если пост не найден или не принадлежит пользователю

## Модели данных

### User

- `id` — UUID
- `email`
- `username`
- `password_hash`
- `created_at`
- `updated_at`

### Post

- `id` — UUID
- `author_id` — UUID пользователя
- `content`
- `created_at`
- `updated_at`

## Валидация и middleware

- `src/middlewares/validation.middleware.ts` — проверяет `body`, `query` и `params`
- `src/middlewares/auth.guard.ts` — извлекает `Bearer` токен и заполняет `req.user`
- `src/middlewares/post-owner.guard.ts` — проверяет право владельца одного поста
- `src/middlewares/error.handler.ts` — обработка ошибок и конвертация `HttpError`

## Ошибки

В проекте используется класс `HttpError` для явного ответа с кодом и сообщением.

- `400` — неверные данные запроса
- `401` — неавторизованный доступ
- `404` — ресурс не найден
- `409` — конфликт (email уже зарегистрирован)
- `500` — внутренняя ошибка сервера

## Примечания

- `app.ts` подключает middleware `helmet`, `cors`, `express.json` и `morgan`
- Swagger документация строится статически в `src/swagger.ts`
- База данных настраивается через TypeORM и миграции в `src/db/migrations`
- Проект использует `dotenv` и проверяет значения через `zod`.
