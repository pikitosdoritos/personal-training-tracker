# Инструкция по запуску TrackFit 🚀

Этот проект состоит из двух основных частей: **Frontend** (Next.js) и **Backend** (FastAPI).

## Вариант 1: Запуск через Docker (Рекомендуется)
Это самый простой способ, так как Docker сам настроит базу данных PostgreSQL и все зависимости.

1. Убедитесь, что у вас установлен **Docker Desktop**.
2. В корневой директории проекта выполните команду:
   ```bash
   docker-compose up --build
   ```
3. После завершения сборки:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Документация API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Вариант 2: Ручной запуск (для разработки)

### 1. Запуск Backend (FastAPI)
Для работы бэкенда локально вам понадобится установленный Python 3.11+.

1. Перейдите в папку бэкенда:
   ```bash
   cd backend
   ```
2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   ```
3. Активируйте его:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```
5. Запустите сервер:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Запуск Frontend (Next.js)
Убедитесь, что у вас установлена Node.js 18+.

1. Перейдите в папку фронтенда:
   ```bash
   cd frontend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите сервер разработки:
   ```bash
   npm run dev
   ```
4. Откройте [http://localhost:3000](http://localhost:3000).

---

## Наполнение базы данных (Seed)
Чтобы в приложении сразу появились тестовые данные (тренеры, клиенты, сессии):

1. Убедитесь, что бэкенд настроен и база данных доступна.
2. В папке `backend` выполните:
   ```bash
   python seed.py
   ```

## Возможные проблемы
- **Ошибка npm install в корне**: Команды npm нужно запускать именно внутри папки `frontend`, так как там находится `package.json`.
- **База данных**: Если вы запускаете бэкенд вручную без Docker, убедитесь, что у вас установлена PostgreSQL и в `backend/app/core/config.py` указана верная ссылка `DATABASE_URL`.
