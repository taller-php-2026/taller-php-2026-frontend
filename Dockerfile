FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Run build with memory limit to prevent OOM on 1GB VM
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/taller-php-2026-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
