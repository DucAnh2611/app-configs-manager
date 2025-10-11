FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install  # install devDependencies (includes ts-node-dev)

COPY . .

RUN npm install -g ts-node-dev


# Enable hot reload
CMD ["npm", "run", "dev"]
