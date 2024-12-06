FROM bitnami/node:22

# Set the working directory in the container
WORKDIR /app

# Copy the application source code to the container
COPY . .

# Install application dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN npx prisma generate

# Define the port on which the NestJS application is listening
# EXPOSE 3500
ENV PORT=3500

# Build app
RUN pnpm run build

# Start the NestJS application
CMD ["node" , "dist/main.js"]
