# Multi-stage build for baseline-check-tool
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY LICENSE ./
COPY README.md ./

# Install globally
RUN npm install -g .

# Production stage
FROM node:18-alpine

# Install baseline-check-tool globally
COPY --from=builder /usr/local/lib/node_modules/baseline-check-tool /usr/local/lib/node_modules/baseline-check-tool
COPY --from=builder /usr/local/bin/baseline-check /usr/local/bin/baseline-check

# Create a wrapper script for ES modules
RUN echo '#!/bin/sh' > /usr/local/bin/baseline-check-wrapper && \
    echo 'cd /usr/local/lib/node_modules/baseline-check-tool && node src/cli.js "$@"' >> /usr/local/bin/baseline-check-wrapper && \
    chmod +x /usr/local/bin/baseline-check-wrapper

# Create app directory
WORKDIR /workspace

# Set default command
ENTRYPOINT ["baseline-check-wrapper"]
CMD ["--help"]

# Labels for metadata
LABEL maintainer="Baseline Check Team <team@baseline-check.dev>"
LABEL description="Check web features for baseline browser compatibility"
LABEL version="2.1.3"
LABEL repository="https://github.com/rasike-a/baseline-check"
