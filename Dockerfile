# Gunakan base image resmi Node.js dengan Alpine untuk ukuran yang lebih kecil
FROM node:18-alpine AS builder

# Install pnpm secara global
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Salin file package.json dan pnpm-lock.yaml untuk instalasi dependensi
COPY package.json pnpm-lock.yaml ./

# Install dependencies menggunakan pnpm
RUN pnpm install --frozen-lockfile

# Salin seluruh proyek ke dalam container
COPY . .

# Build aplikasi Next.js
RUN pnpm build

# Gunakan image baru untuk menjalankan aplikasi agar lebih ringan
FROM node:18-alpine AS runner
WORKDIR /app

# Install pnpm di runtime container
RUN npm install -g pnpm

# Salin hasil build dari tahap builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json ./

# Jalankan aplikasi Next.js
CMD ["pnpm", "start"]
