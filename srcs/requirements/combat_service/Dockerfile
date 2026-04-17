FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ && \
    rm -f package-lock.json && \
    npm install

COPY . .

RUN npm run build

EXPOSE 8003

CMD ["npm", "run", "start:dev"]
