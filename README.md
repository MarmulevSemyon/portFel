**PortFel** — это современное веб-приложение для инвесторов и трейдеров, позволяющее эффективно управлять своими инвестициями, анализировать доходность, структуру активов, а также импортировать сделки с брокерских платформ.

## 🚀 О проекте

portFel реализован как SPA с разделением клиентской и серверной частей. В основе — стек **React + Django + PostgreSQL**, обеспечивающий масштабируемость, отказоустойчивость и быструю работу системы.

Приложение включает в себя:

- управление несколькими инвестиционными портфелями;
- добавление и анализ активов и сделок;
- расчёт доходности и годового CAGR;
- визуализацию распределения активов;
- импорт из сторонних API (например, Т-Инвестиции);
- регистрацию и аутентификацию пользователей;
- юзабилити-интерфейс и персонализацию.

## 🧰 Технологии

### Клиентская часть (Frontend)
- **React** + **TypeScript**
- **Redux** — глобальное состояние
- **React Router** — маршрутизация
- **MUI (Material UI)** — UI-компоненты
- **Axios** — взаимодействие с API
- **Recharts** — визуализация графиков

### Серверная часть (Backend)
- **Django** — фреймворк на Python
- **Django REST Framework** — REST API
- **JWT** — аутентификация и безопасность
- **PostgreSQL** — реляционная СУБД
- **Gunicorn + Nginx** — продакшн-сервер

## 📦 Установка и запуск

### 🔽 0. Предварительные зависимости

Перед установкой убедитесь, что у вас установлены:

```bash
# Python и PostgreSQL
sudo apt update
sudo apt install python3.12 python3.12-venv postgresql postgresql-contrib libpq-dev

# Установка pip (если нет)
sudo apt install python3-pip

# Node.js (лучше через nvm):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```
---

### 🛠 1. Настройка базы данных PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE invest_db;
CREATE USER postgres WITH PASSWORD '1010';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE invest_db TO postgres;
\q
```

---
### 1. Клонирование репозитория

```bash
git clone https://github.com/MarmulevSemyon/portFel.git
cd portFel
```
### 🐍 2. Backend (Django)

```bash
cd portfel_back
python3.12 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

# Миграции
python manage.py migrate

# Запуск
python manage.py runserver
```

---

### ⚛️ 3. Frontend (React)

```bash
cd ../portfel_front

# Установка зависимостей
npm install

# Запуск React-приложения
npm run start
```

---

## 🌐 Доступ

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:8000

---
