# Swachh Bharatham

Swachh Bharatham is a smart, eco-friendly Progressive Web App designed to promote responsible waste disposal and community engagement. The app addresses urban waste challenges like overflowing bins and irregular collection by combining gamification, user location, and optional IoT-based bin monitoring.

Users sign up with their personal information, including address, which automatically assigns them to a local community. The dashboard displays their XP, daily streak, individual and community rank, along with quick actions to add waste, scan QR codes, or find nearby bins. Waste can be added manually or via AI-assisted image classification, and items are tracked in a “Yet to Dispose” list. Each bin has a static QR code; scanning it verifies disposal and updates XP, providing an engaging gamified experience.

The bin locator shows the nearest bins on a clean, color-coded map, hiding full bins. Optionally, bins can be equipped with ultrasonic sensors (HC-SR04) connected to microcontrollers (ESP32, Arduino, or Pico W) that detect fill levels and send updates to the Supabase backend via REST APIs. This allows real-time monitoring of bin availability.

Supabase handles authentication, database storage, and real-time updates for users, disposals, XP, and leaderboard rankings. Gamification features include badges, streaks, and top-ranking highlights for individuals and communities, fostering friendly competition.

Swachh Bharatham combines PWA design, IoT integration, AI, and gamification to create a practical, scalable, and visually appealing solution for cleaner communities, engaging citizens in sustainable behavior while supporting municipal waste management efficiently.

## Features

### Core Functionality
- **User Authentication**: Secure signup/login with Supabase Auth
- **Waste Tracking**: Log waste disposals with category selection, weight, and photos
- **Smart Waste Bins Map**: Interactive map to locate nearby waste collection bins
- **QR Code Scanning**: Scan bin QR codes for quick waste logging
- **User Profiles**: Manage profile information and track personal stats

### Gamification System
- **XP & Points**: Earn 10 XP per kg of waste disposed
- **Badges & Achievements**: 5 unique badges based on waste disposal milestones
- **Leaderboards**: Global rankings by waste disposed and points earned
- **Level System**: Progress through levels as you earn XP
- **Community Challenges**: Join time-limited challenges with bonus rewards

### AI Features
- **Waste Classification**: AI-powered image analysis to automatically classify waste type
- **Confidence Scoring**: Machine learning confidence levels for classifications
- **Batch Processing**: Process multiple images at once
- **Recommendations**: Get handling recommendations for each waste type

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Leaflet.js** - Interactive mapping
- **SWR** - Data fetching and caching
- **Supabase Auth** - Authentication

### Backend
- **Supabase** - PostgreSQL database, auth, and RLS
- **FastAPI** - Python API for AI classification
- **ONNX Runtime** - TrashNet model inference
- **Vercel** - Frontend deployment

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase project with configured auth
- Python 3.10+ (for FastAPI backend)

### Frontend Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_AI_API_URL=http://localhost:8000
   ```

3. **Database Setup**
   - Copy the SQL from `/scripts/init-db.sql`
   - Paste into Supabase SQL Editor and execute
   - This creates all tables, indexes, RLS policies, and inserts sample data

4. **Run Development Server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`

### Backend Setup (FastAPI)

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run FastAPI server**
   ```bash
   python main.py
   ```
   API will be available at `http://localhost:8000`
   Docs at `http://localhost:8000/docs`

## Project Structure

```
/
├── app/
│   ├── page.tsx                 # Home/landing page
│   ├── auth/
│   │   ├── signup/page.tsx     # Sign up page
│   │   ├── login/page.tsx      # Login page
│   │   └── verify-email/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx            # Main dashboard
│   │   ├── waste/page.tsx      # Log waste disposal
│   │   ├── map/page.tsx        # Find bins map
│   │   ├── leaderboard/page.tsx # Rankings
│   │   ├── achievements/page.tsx # Badges
│   │   ├── challenges/page.tsx   # Challenges
│   │   ├── scan/page.tsx        # QR scanning
│   │   └── profile/page.tsx     # User profile
│   └── api/
│       └── waste/route.ts       # Waste logging API
├── components/
│   ├── dashboard/
│   │   ├── nav.tsx
│   │   ├── stats-overview.tsx
│   │   ├── quick-actions.tsx
│   │   └── recent-activity.tsx
│   ├── map/
│   │   └── bin-map.tsx          # Leaflet map component
│   └── ui/                      # shadcn/ui components
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   └── useAIClassification.ts  # AI classification hook
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── scripts/
│   └── init-db.sql             # Database schema
├── backend/
│   ├── main.py                 # FastAPI application
│   └── requirements.txt         # Python dependencies
└── public/                      # Static assets
```

## Database Schema

### Core Tables
- `auth.users` - User authentication (managed by Supabase)
- `user_profiles` - Extended user info (name, bio, stats)
- `waste_categories` - Waste type categories
- `waste_logs` - Individual waste disposal records
- `bins` - Waste collection bin locations
- `badges` - Badge definitions
- `user_badges` - User's earned badges
- `leaderboards` - User rankings
- `xp_logs` - XP transaction history
- `challenges` - Community challenges
- `challenge_participants` - User challenge participation

### Row Level Security (RLS)
- Users can only view their own waste logs
- Users can only update their own profiles
- All public data (bins, badges, leaderboards) is viewable by everyone

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/signin` - Login to account
- `POST /auth/signout` - Logout

### Waste Logging
- `POST /api/waste` - Log new waste disposal
- Automatically updates user stats and checks badge criteria

### FastAPI AI Backend
- `POST /classify` - Classify single waste image
- `POST /batch-classify` - Classify multiple images
- `GET /health` - Health check

## Gamification System

### XP Calculation
- **Base XP**: 10 XP per kg of waste
- **Bonus XP**: Additional from challenges
- **Level Up**: 1000 XP per level

### Badges (5 Total)
1. **First Steps** (0.5kg) - Complete first waste disposal
2. **Eco Warrior** (10kg) - Dispose 10kg waste
3. **Green Champion** (50kg) - Dispose 50kg waste
4. **Waste Warrior Pro** (100kg) - Dispose 100kg waste
5. **Community Hero** (1000 points/month) - Earn 1000 points

### Leaderboards
- **Global Ranking**: Based on total waste disposed
- **Points Ranking**: Based on total XP earned
- Updates automatically after each waste log

## Sample Data

### Waste Bins (Auto-inserted)
5 sample bins across Delhi with locations:
- Central Park Bin (28.6139, 77.2090)
- Market Street Bin (28.6328, 77.2197)
- Green Avenue Bin (28.5355, 77.3910)
- Downtown Bin (28.7041, 77.1025)
- Riverside Bin (28.6045, 77.2473)

### Sample Challenges
Create custom challenges in Supabase dashboard to encourage waste disposal goals.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_AI_API_URL=http://localhost:8000  # Local or deployed backend
```

### Backend (.env)
```env
DATABASE_URL=your-supabase-connection-string
AI_MODEL_PATH=path/to/trashnet-model.onnx
```

## Future Enhancements

1. **Mobile App**: React Native version with offline support
2. **Real-time Updates**: WebSocket integration for live stats
3. **Social Features**: Friend lists, team challenges, social feed
4. **Rewards System**: Redeem points for coupons/prizes
5. **IoT Integration**: Connect to smart bins with sensors
6. **Advanced Analytics**: Waste trend analysis and insights
7. **Multi-language**: Support for regional languages
8. **Offline Mode**: Progressive Web App capabilities

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Automatic deployments on push

### Backend (Heroku/Railway/Render)
1. Create account on hosting platform
2. Create new project from GitHub
3. Set Python runtime and environment variables
4. Deploy from main branch

## Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

## License

MIT License - See LICENSE file for details

## Contributors

Built with passion for making India cleaner and more sustainable.
