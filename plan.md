# Website Chatbot SaaS Platform

## Project Overview
Build a SaaS platform where small website owners can register, create AI chatbots trained on their website content, and integrate them into their sites. The platform will handle user management and bot registration, while N8N handles the heavy lifting of web scraping, AI training, and embeddings.

## Tech Stack
- **Frontend**: React.js + TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Authentication**: Supabase Auth
- **Automation Backend**: N8N (web scraping, training, vector stores)
- **Deployment**: Vercel (frontend) + N8N self-hosted

## Database Schema (Supabase)

### Users Table
```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  email varchar unique not null,
  full_name varchar,
  created_at timestamp default now(),
  subscription_tier varchar default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  max_bots integer default 1
);
```

### Bots Table
```sql
create table bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  name varchar not null,
  website_url varchar not null,
  status varchar default 'pending' check (status in ('pending', 'training', 'ready', 'error')),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  last_trained_at timestamp,
  integration_code text,
  n8n_workflow_id varchar,
  total_pages_scraped integer default 0,
  embedding_status varchar default 'not_started'
);
```

### Bot Analytics Table (Future)
```sql
create table bot_analytics (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references bots(id) on delete cascade,
  conversations_count integer default 0,
  messages_count integer default 0,
  last_used_at timestamp,
  date date default current_date
);
```

## Frontend Structure

### Initial Setup
```bash
# Create React app with TypeScript
npx create-react-app chatbot-saas --template typescript
cd chatbot-saas

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install and setup shadcn/ui
npx shadcn-ui@latest init

# Install additional dependencies
npm install @supabase/supabase-js react-router-dom lucide-react
npm install -D @types/node
```

### shadcn/ui Components to Install
```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
```

### 1. Authentication Pages
- **`/login`** - Login form with shadcn/ui components
- **`/signup`** - Registration form with validation
- **`/forgot-password`** - Password reset with proper UX

### 2. Dashboard Pages
- **`/dashboard`** - Main dashboard with bots table using DataTable
- **`/bot/:bot-id`** - Individual bot management page
- **`/bot/:bot-id/integrate`** - Integration instructions and code
- **`/settings`** - User account settings
- **`/pricing`** - Subscription plans (future)

### 3. Key Components with shadcn/ui

#### Dashboard Component
```jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Bot, ExternalLink, Settings } from "lucide-react"

// Shows table of user's bots with:
// - Bot name and status badge
// - Website URL with external link
// - Status (pending/training/ready/error)
// - Created date
// - Actions dropdown menu
// - Floating action button "Create New Bot"
```

#### Bot Management Component
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Individual bot page with:
// - Bot details card with status
// - Tabs for Overview/Settings/Analytics
// - Training progress indicator
// - Integration code snippet with copy button
// - Training/Retrain action buttons
```

#### Auth Components
```jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Clean, centered auth forms with proper validation
// Loading states with button disabled state
// Error handling with alert components
```

## Core Features

### Phase 1 - MVP
1. **User Authentication** (Supabase Auth)
2. **Bot Registration** - Enter website URL and bot name
3. **Bot Dashboard** - View all registered bots
4. **N8N Integration** - Trigger training workflows
5. **Basic Integration Code** - JavaScript snippet for websites

### Phase 2 - Enhanced Features
1. **Advanced Training Options** - Custom instructions, excluded pages
2. **Real-time Training Status** - WebSocket updates
3. **Analytics Dashboard** - Conversation metrics
4. **Multiple Integration Methods** - Shopify app, WordPress plugin, iframe

### Phase 3 - Scale Features
1. **Subscription Management** - Stripe integration
2. **Advanced Customization** - Bot appearance, behavior
3. **API Access** - Developer API for bot management
4. **White-label Solutions** - Custom branding

## N8N Workflow Integration

### Bot Training Workflow
1. **Webhook Trigger** - Receives bot creation/training requests
2. **Website Scraping** - Crawl target website
3. **Content Processing** - Clean and chunk text content
4. **Embedding Generation** - Create vector embeddings with Gemini
5. **Vector Store** - Store in Pinecone/Weaviate
6. **Status Update** - Update bot status in Supabase
7. **Notification** - Email user when training complete

### Chat API Workflow
1. **Chat Webhook** - Receive user messages
2. **Context Retrieval** - Search vector store for relevant content
3. **AI Response** - Generate response with Gemini
4. **Response Delivery** - Return formatted response
5. **Analytics Logging** - Track usage metrics

## Integration Methods

### 1. JavaScript Widget (Primary)
```javascript
// Embeddable script that website owners add to their sites
<script src="https://yourdomain.com/widget.js"></script>
<script>
  ChatBot.init({
    botId: 'uuid-here',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

### 2. Shopify App (Future)
- Custom Shopify app for easy installation
- One-click bot deployment
- Automatic product catalog integration

### 3. WordPress Plugin (Future)
- WordPress plugin for easy integration
- Admin panel for bot management
- Shortcode support

## File Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Dashboard/
│   │   ├── BotTable.jsx
│   │   ├── CreateBotModal.jsx
│   │   └── StatsCards.jsx
│   ├── Bot/
│   │   ├── BotDetails.jsx
│   │   ├── TrainingStatus.jsx
│   │   ├── IntegrationCode.jsx
│   │   └── BotSettings.jsx
│   └── Common/
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── Loading.jsx
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── BotDetails.jsx
│   └── Integration.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useBots.js
│   └── useSupabase.js
├── services/
│   ├── supabaseClient.js
│   ├── botService.js
│   └── n8nService.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validation.js
└── App.jsx
```

## API Endpoints (N8N Webhooks)

### Training API
- **POST** `/webhook/train-bot` - Start bot training
- **GET** `/webhook/bot-status/:botId` - Get training status
- **POST** `/webhook/retrain-bot` - Retrain existing bot

### Chat API
- **POST** `/webhook/chat/:botId` - Send message to bot
- **GET** `/webhook/bot-info/:botId` - Get bot configuration

## Development Phases

### Week 1-2: Foundation
- [ ] Set up React project with routing
- [ ] Implement Supabase authentication
- [ ] Create database schema
- [ ] Build login/signup pages
- [ ] Create basic dashboard layout

### Week 3-4: Core Features
- [ ] Bot registration functionality
- [ ] N8N webhook integration
- [ ] Bot management dashboard
- [ ] Training status tracking
- [ ] Basic integration code generation

### Week 5-6: Polish & Testing
- [ ] Error handling and validation
- [ ] UI/UX improvements
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Documentation

## Environment Variables

```env
# Supabase
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# N8N
REACT_APP_N8N_WEBHOOK_URL=your-n8n-webhook-url
REACT_APP_N8N_API_KEY=your-n8n-api-key

# Gemini AI
REACT_APP_GEMINI_API_KEY=your-gemini-api-key

# App Config
REACT_APP_CHAT_WIDGET_URL=https://yourdomain.com/widget.js
REACT_APP_CHAT_API_URL=https://yourdomain.com/api/chat
```

## Monetization Strategy

### Free Tier
- 1 bot
- 100 conversations/month
- Basic customization

### Pro Tier ($29/month)
- 5 bots
- 1,000 conversations/month
- Advanced customization
- Analytics dashboard

### Enterprise Tier ($99/month)
- Unlimited bots
- Unlimited conversations
- White-label options
- Priority support

## Success Metrics
- User registration rate
- Bot creation completion rate
- Integration success rate
- Monthly active bots
- Customer retention rate
- Revenue per user

## Technical Considerations

### Performance
- Lazy load components
- Implement caching for bot status
- Optimize database queries
- CDN for widget delivery

### Security
- Implement rate limiting
- Validate website URLs
- Sanitize user inputs
- Secure API endpoints

### Scalability
- Horizontal scaling with N8N
- Database connection pooling
- Implement caching layer
- Monitor resource usage

## Next Steps
1. Set up development environment
2. Initialize React project with TypeScript
3. Configure Supabase project and authentication
4. Create N8N workflows for training and chat
5. Build MVP with core features
6. Test with target websites (Shopify, website builders)
7. Launch beta with select users
8. Iterate based on feedback
9. Scale and add advanced features

---

This plan provides a solid foundation for building your chatbot SaaS platform. The modular approach allows for iterative development while keeping the N8N backend separate for easier maintenance and scaling.