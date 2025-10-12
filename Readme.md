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

4. Pull environment variables:  
```bash
npx dotenv-vault@latest pull  
``` 

5. Build and start Docker:  
```bash
docker compose up --build  
```

6. Migration
```bash
npm run build
npm run migration:run
```

7. Run dev
```bash
npm run dev
```

8. Set up CLI command to use in **Git Bash** without `--` (Window -> setup on Git Bash):
```bash
chmod +x bin/app_config.js
npm link
# Note: If success you just need to use `app_config <cmd>` instead of `npm run add --`
```

---

## 🧪 Development & Migrations

When implementing new features or updating the database:

1. Generate a new migration:  
npm run migration:generate Name_Of_Migration  

2. Build the project:  
```bash
npm run build  
```

3. Run migrations inside Docker:  
```bash
docker exec app_configs_backend npm run migration:run  
```

---

## 🧭 Summary of Key Commands

Run backend service: `docker compose up --build  `
Run CLI command: `docker exec app_configs_backend npm run app <command> ` 
Generate migration: `npm run migration:generate <Name>  `
Apply migrations: `docker exec app_configs_backend npm run migration:run`
