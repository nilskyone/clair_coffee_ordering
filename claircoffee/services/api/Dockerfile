FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY services/api/package.json services/api/tsconfig.json ./services/api/
COPY packages/utils/package.json packages/utils/tsconfig.json ./packages/utils/
RUN corepack enable && pnpm install --frozen-lockfile=false
COPY services/api ./services/api
COPY packages ./packages
WORKDIR /app/services/api
EXPOSE 3001
CMD ["pnpm", "dev"]
