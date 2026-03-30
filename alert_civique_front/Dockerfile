FROM node:18-alpine

WORKDIR /app

# installer expo
RUN npm install -g expo-cli

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]