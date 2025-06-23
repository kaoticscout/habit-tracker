# Routinely - Ultra-Minimalist Habit Tracker

A zen-inspired habit tracking web application built with Next.js, featuring an ultra-clean interface and seamless user experience.

![Routinely Screenshot](https://via.placeholder.com/800x400?text=Routinely+Habit+Tracker)

## ✨ Features

- **Ultra-Minimalist Design**: Clean, zen-inspired interface that focuses on simplicity
- **Smart Habit Tracking**: Support for various frequencies (daily, weekly, monthly, custom intervals)
- **Progress Calendar**: Beautiful monthly view showing your habit completion patterns
- **Guest & Authenticated Modes**: Start tracking immediately, create account to sync data
- **Seamless Data Migration**: localStorage data automatically transfers when creating an account
- **Daily Habit Check**: Automated system ensures complete historical tracking
- **Mobile Responsive**: Perfect experience across all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Styled Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (with Vercel Cron for automated tasks)
- **Testing**: Jest, React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```bash
   DATABASE_URL="file:./dev.db"  # SQLite for development
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   JWT_SECRET="your-jwt-secret"
   CRON_SECRET="your-cron-secret"
   ```

4. **Set up database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Visit the app**
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run test:daily-check` - Test daily habit check endpoint

## 🌐 Deployment

### Deploy to Vercel (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

**Quick Deploy:**

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set up environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/habit-tracker)

### Required Environment Variables for Production

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secure-secret"
JWT_SECRET="your-jwt-secret"
CRON_SECRET="your-cron-secret"
NODE_ENV="production"
```

## 🎯 Key Features Explained

### Guest Mode
- Start tracking habits immediately without signup
- Data stored in localStorage
- Full functionality available
- Sample habits pre-populated for demonstration

### Account Creation & Data Migration
- Seamless transition from guest to authenticated user
- All localStorage data automatically transferred to database
- Historical progress preserved during migration
- Clean data separation between modes

### Daily Habit Check System
- Automated daily processing at midnight UTC
- Creates completion logs for missed habits
- Ensures accurate historical calendar data
- Supports all habit frequencies intelligently

### Progress Calendar
- Monthly view with intensity-based visualization
- Hover tooltips with detailed information
- Clean legend and statistics
- Mobile-responsive design

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Test specific features:
```bash
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:daily-check    # Test daily habit check
```

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   └── ...
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and configs
│   ├── styles/            # Styled components
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── scripts/               # Utility scripts
└── ...
```

## 🔒 Security

- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes with session validation
- CRON endpoints secured with bearer tokens
- Environment variables for all secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by zen philosophy and minimalist design principles
- Built with modern web technologies for optimal performance
- Designed for habit formation and personal growth

---

**Start building better routines today!** 🌱