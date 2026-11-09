# ---------- Étape 1 : construction du site ----------
FROM node:24-alpine AS build

WORKDIR /app

# Dépendances d'abord, pour profiter du cache
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Puis le reste du code
COPY . .

# URL de l'API, fixée au moment du build (par défaut /api, redirigé par nginx)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ---------- Étape 2 : nginx sert les fichiers statiques ----------
FROM nginxinc/nginx-unprivileged:alpine AS runtime

# Configuration fournie par le projet (port 8080, redirection de /api/ vers le service api)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Uniquement le résultat du build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080