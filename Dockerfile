FROM node:20-alpine

RUN apk add --no-cache redis

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install  # install devDependencies (includes ts-node-dev)

COPY . .

RUN npm install -g ts-node-dev

RUN npm run prepare:docker

# Enable hot reload
CMD ["npm", "run", "dev"]
