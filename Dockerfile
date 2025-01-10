FROM node:20.10.0 AS ui-builder
WORKDIR /ui
COPY ./ui/package*.json ./
RUN npm install
COPY ./ui ./
RUN npm run build

FROM node:20.10.0 AS api-builder
WORKDIR /api
COPY ./api/package*.json ./
RUN npm install
COPY ./api ./
RUN npm run build

FROM node:20.10.0 AS final-build
WORKDIR /app

COPY --from=ui-builder /ui/build ./ui-build

COPY --from=api-builder /api/build ./api-build

EXPOSE 3000
EXPOSE 3001

CMD ["bash", "-c", "echo Parent image build completed. Use 'docker compose up -d' to start services."]
