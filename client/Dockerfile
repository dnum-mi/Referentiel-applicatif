# Utiliser l'image Node.js comme base
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml (ou package-lock.json)
COPY ./package.json ./pnpm-lock.yaml ./

# Installer les dépendances
RUN npm install -g pnpm && pnpm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port utilisé par Vite
EXPOSE 5173

# Commande pour démarrer le serveur de développement
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
