FROM node:25.6-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN npm install -g pnpm@latest

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
CMD ["pnpm", "start"]