FROM bitnami/node:22

# Set the working directory in the container
WORKDIR /app

# Copy the application source code to the container
COPY . .

# Install application dependencies
RUN npm install -g pnpm
RUN pnpm install
RUN npx prisma generate

# Expose the port that your NestJS application will run on
ENV PORT=3500

# Build app
RUN pnpm run build

# Start the NestJS application
CMD ["node" , "dist/main.js"]
