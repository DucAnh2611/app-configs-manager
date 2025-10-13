# 🧩 App Configuration Management

A secure and efficient **App Configuration Management Service** to save and update app configurations, provide API keys, and manage everything via CLI.

---

## ⚙️ CLI Commands

### 🔧 App Management
```bash
npm run app -- app:list  
npm run app -- app:create--code --name  
npm run app -- app:update--id <--code> <--name>  
npm run app -- app:delete--ids id1,id2,id3,id4
npm run app -- app:detail--id  
```

### 🔐 API Key Management
```bash
npm run app -- api_key:new--code <--description> <--type=CONFIG|UP_CONFIG|THIRD_PARTY> <--length>  
npm run app -- api_key:reset--code --id <--length>  
# Notes:
# - Reset and New return an encrypted auth token that only appears once.
# - If type=THIRD_PARTY, a public_key is also generated and must be used to verify the API key.
```

```bash
npm run app -- api_key:list<--code>  
npm run app -- api_key:toggle--code --id  
npm run app -- api_key:edit--code --id <--description> <--isDelete>  
# Note: Use only --isDelete when deleting an API key.
```

---

## 🚀 Setup & Run

**Prerequisites:** Node.js ≥ 20, Docker installed  

1. Clone the repository:  
git clone <your-repo-url>  
cd <repo-name>  

2. Install dependencies:  
```bash
npm install
```  

3. Login into Dotenv Vault ([https://www.dotenv.org/](https://www.dotenv.org/))  
After being added to the team, set up your vault.   
```bash
npm run dotenv:login
``` 

4. Pull environment variables:  
```bash
npm run dotenv:pull
``` 

5. Build and start Docker:  
```bash
npm run prepare:docker

# Note: After run above command, .env.docker will be created, apply this line to .env.docker
# DATABASE_HOST="postgres"
# REDIS_HOST= redis

docker compose up --build -d
```

6. Migration
```bash
npm run migration:run
```

7. Set up CLI command to use in **Git Bash** without `--` (Window -> setup on Git Bash):
```bash
chmod +x bin/app_config.js
npm link
# Note: If success you just need to use `app_config <cmd>` instead of `npm run add --`
```

---

## 🧪 Development & Migrations

When implementing new features or updating the database:

1. Generate a new migration:  
```bash
npm run migration:generate Name_Of_Migration  
```

2. Run migrations:  
```bash
npm run migration:run  
```

3. Revert migrations:  
```bash
npm run migration:revert  
```