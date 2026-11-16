# Deal & Booking Tracker

A mobile-first full-stack web application designed for fast, secure event deal/booking tracking, payment records (token paid vs pending balance), and lock protections.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite + TypeScript) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **Security**: 4-digit admin PIN unlock (`2702`) to edit/view masked figures and prevent accidental edits

---

## 📦 Features

- **Mobile-First Card Interface**: Designed specifically for on-the-go usage on mobile screens.
- **One-Tap Direct Calling**: Instant dialer shortcut to call client directly.
- **Amount Masking**: Amounts are masked (`₹ 7****`) by default, preventing shoulder-surfing.
- **Admin PIN Protection**:
  - Locked cards cannot be edited, deleted, or unmasked.
  - Tapping **Unlock** prompts for the 4-digit code (`2702`).
- **Custom Event Statuses**:
  - Booked with Token (Green)
  - Booked without Token (Amber)
  - Completed (Blue, with muted styling)
  - Cancelled (Red, with muted styling)
- **Live Search & Filter**: Filter by booking status and search across purpose, contact name, or phone number.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment
Create `server/.env`:
```env
PORT=5000
ADMIN_PIN=2702
```

### 3. Initialize Database
```bash
cd server
npx prisma db push
cd ..
```

### 4. Run Both Servers
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🌐 Deployment Options

### Option 1: Render / Railway / Fly.io (Recommended for Full-Stack)
- Deploy backend service from `/server`.
- Deploy frontend static site from `/client` (or serve `client/dist` directly through Express).
- Set Environment Variable: `ADMIN_PIN=2702`.

### Option 2: VPS / Cloud Instance (Ubuntu / DigitalOcean / EC2)
- Clone repository, run `npm run install:all`, `npm run build`.
- Use PM2 to run `npm --prefix server run start`.
- Configure Nginx reverse proxy to forward traffic to port 5000 / 3000.
