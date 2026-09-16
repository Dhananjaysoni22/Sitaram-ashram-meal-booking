# Deployment Guide (Docker)

This guide walks you through deploying the application on a fresh Linux server (e.g., Ubuntu).

## 1. Prerequisites (On the Server)

Install **Git** and **Docker**:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 2. Clone the Code

```bash
git clone <YOUR-GITHUB-REPO-URL>
cd maharaj
```

## 3. Configure the Environment

The `docker-compose.yml` file uses sensible defaults for the database. 
However, for production security, create a `.env` file in the **root directory** (same folder as `docker-compose.yml`):

```bash
nano .env
```

Paste this inside:
```env
# Database Credentials
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="ashram_meal_booking_db"

# Backend Connection String (Must match the above)
DATABASE_URL="postgresql://postgres:postgres@db:5432/ashram_meal_booking_db?schema=public"

# Security
JWT_SECRET="YourVeryLongRandomSecretStringHere12345!"

# Telegram Integration (Optional)
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"
```
Press `Ctrl+O`, `Enter`, and `Ctrl+X` to save and exit.

## 4. Start the Application

Run the following command in the `maharaj` folder:
```bash
sudo docker compose up -d --build
```

**What this does:**
1. Downloads PostgreSQL and creates the database.
2. Builds the Backend.
3. Once the database is ready, the Backend container automatically creates the tables (`db push`) and creates the default Super Admin user (`admin` / `1080`).
4. Builds the Frontend React application and starts serving it on port 80.

## 5. Verify and Login

Open your web browser and go to the server's IP address:
`http://<SERVER-IP-ADDRESS>`

You can now log in using:
- **Username:** `admin`
- **PIN:** `1080`

**Note:** If the frontend is loading but API calls fail, make sure your server's firewall has opened **Port 80 (HTTP)** and **Port 5000 (API)**.
```bash
sudo ufw allow 80/tcp
sudo ufw allow 5000/tcp
```

