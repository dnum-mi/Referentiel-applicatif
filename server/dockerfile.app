FROM bitnami/node:22

# Set the working directory in the container
WORKDIR /app

# Copy the application source code to the container
COPY . .

# Install application dependencies
RUN pnpm install
RUN npx prisma generate

# Expose the port that your NestJS application will run on
ENV PORT=3500

# Build app
RUN pnpm run build

EXPOSE 3500

# Start the NestJS application
CMD [ "npm", "run", "start:prod" ]
