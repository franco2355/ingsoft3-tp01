FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS test
COPY . .
CMD ["npm", "run", "test:coverage"]

FROM dependencies AS build
COPY . .
RUN npm run build


FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist .
EXPOSE 3000
CMD ["node", "server.mjs"]
