# 🧠 DecideAI — AI-Powered Decision-Making & Future Reflection Platform

## Project Overview

DecideAI is an AI-powered personal decision-making and reflection platform designed to help users think through complex decisions, evaluate alternatives, document their reasoning, and revisit important decisions later with new context.

The application uses Google's Gemini API to support multi-turn conversations and transform user discussions into structured Decision Snapshots. These snapshots capture the user's original thinking, options considered, key priorities, trade-offs, concerns, insights, and suggested next steps.

A key original enhancement of the platform is the **Future Me Check-in** feature. Users can schedule a future review of a decision and later return to reflect on what actually happened. Gemini uses the original decision context together with the user's new reflection to help them identify what changed, where their assumptions were correct or incorrect, and what they learned.

The platform demonstrates:

- Secure AI-powered multi-turn conversations
- Firebase Authentication
- User-isolated Firestore data storage
- Gemini API integration
- Decision Snapshot generation
- Future decision reflection
- Scheduled Future Me Check-ins
- Context-aware AI analysis
- Secure secret management
- Cloud-native deployment using Google Cloud Run

---

# 🚀 Challenge Context

This project was built for the **Ideathon Challenge: Build a Secure Personal Gemini Journal**.

The challenge required participants to build an authenticated AI application with:

- User Authentication
- Multi-turn Gemini AI interaction
- Isolated user data storage
- Secure API key management
- At least one original feature enhancement

DecideAI expands the concept of a traditional AI journal into an **AI-assisted decision intelligence and reflection system**.

Instead of simply recording conversations, DecideAI helps users:

1. Explore complex decisions
2. Compare possible options
3. Capture their reasoning
4. Identify important trade-offs
5. Save structured decision snapshots
6. Schedule future reflection sessions
7. Re-evaluate decisions using new real-world context

---

# ✨ Key Features

## 🤖 Multi-Turn Gemini Conversations

Users can have natural multi-turn conversations with Gemini about:

- Career decisions
- Education choices
- Personal goals
- Productivity challenges
- Study strategies
- Professional opportunities
- Complex personal decisions

Gemini maintains conversational context and helps users explore different perspectives and trade-offs.

---

# 📸 Decision Snapshot

Users can convert an important conversation into a structured **Decision Snapshot**.

The snapshot automatically organizes the discussion into meaningful sections.

### Snapshot includes:

- What the user was thinking
- Options considered
- Key factors and priorities
- Main trade-offs
- Biggest concern
- Key insight
- Suggested next step

This allows users to preserve not only the final decision, but also the reasoning behind it.

---

# 🔮 Future Me Check-in

The **Future Me Check-in** is the primary original feature enhancement of DecideAI.

After creating a Decision Snapshot, users can schedule a future date to revisit the decision.

### Example check-in periods:

- 1 Week
- 1 Month
- 3 Months
- 6 Months
- Custom Date

When the selected review date arrives, the user can return to the original decision and begin a reflection conversation.

Gemini is provided with:

- The original decision context
- The options originally considered
- The user's priorities
- Previous concerns
- The original suggested next step
- The user's current reflection

This enables a context-aware comparison between:


Past Thinking
      ↓
Real-World Experience
      ↓
New Reflection
      ↓
AI-Assisted Re-evaluation
      ↓
New Insight

🧠 Context-Aware Reflection

Unlike a standard reminder system, the Future Me Check-in uses Gemini to analyze how the user's situation has changed.

For example, the AI can identify:

Which assumptions were correct
Which concerns became irrelevant
Whether the original strategy worked
Where the actual problem occurred
New factors discovered through experience
What the user should consider going forward

This creates a continuous reflection loop rather than a one-time AI conversation.

🔐 User Authentication

DecideAI uses Firebase Authentication to provide secure user access.

Users must authenticate before accessing their personal conversations and decision data.

The authentication system ensures that application data is associated with the authenticated user.

🗂️ User-Isolated Firestore Storage

All user conversations and Decision Snapshots are stored using Firebase Cloud Firestore.

Data is structured to ensure user-level isolation.

Example architecture:

Firestore
│
├── users
│   │
│   ├── user_1
│   │   ├── conversations
│   │   ├── snapshots
│   │   └── future_checkins
│   │
│   └── user_2
│       ├── conversations
│       ├── snapshots
│       └── future_checkins

Each user can access only their own:

Conversations
Decision Snapshots
Reflection notes
Future Me Check-ins
🔑 Secure Secret Management

Gemini API credentials are not hardcoded into the application source code.

Sensitive configuration is managed securely using:

Google Cloud Secret Manager
Environment variables
.env configuration for local development

The repository includes an .env.example file instead of exposing real credentials.

Example:

GEMINI_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id

Actual production secrets are retrieved securely during deployment.

☁️ Cloud-Native Deployment

The application is designed for deployment using Google Cloud services.

The production architecture includes:

Google Cloud Run
Google Cloud Secret Manager
Firebase Authentication
Cloud Firestore
Gemini API
🏗️ System Architecture
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    DecideAI Web App  │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Firebase Authentication│
                    │   User Verification   │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Gemini AI API    │      │ Cloud Firestore  │
        │ Multi-Turn AI    │      │ User-Isolated    │
        │ Conversations    │      │ Data Storage     │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   Decision Snapshot    │
                  │   Generation Engine    │
                  └────────────┬───────────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │  Future Me Check-in    │
                  │  Scheduling System     │
                  └────────────┬───────────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │ Future Reflection with │
                  │ Original AI Context    │
                  └────────────────────────┘
🔄 Application Workflow
Step 1 — User Authentication

The user signs in through Firebase Authentication.

User
  ↓
Firebase Authentication
  ↓
Authenticated Session
Step 2 — Multi-Turn AI Conversation

The user starts a conversation with DecideAI.

Example:

"Should I pursue a Master's degree abroad or try to get a job directly?"

Gemini helps the user explore:

Possible options
Advantages
Disadvantages
Financial considerations
Career implications
Immigration considerations
Personal priorities
Step 3 — Decision Snapshot Generation

The conversation can be transformed into a structured Decision Snapshot.

Example:

What You Were Thinking
        ↓
Options Considered
        ↓
Key Factors & Priorities
        ↓
Main Trade-Offs
        ↓
Biggest Concern
        ↓
Key Insight
        ↓
Suggested Next Step

The snapshot is stored securely in Firestore.

Step 4 — Future Me Check-in Scheduling

The user selects when they want to revisit the decision.

Decision Snapshot
        ↓
Select Review Date
        ↓
Save Future Check-in
        ↓
Store in Firestore
        ↓
Review Date Arrives

Available scheduling options include:

1 Week
1 Month
3 Months
6 Months
Custom Date
Step 5 — Future Reflection

When the user revisits the decision, Gemini receives the original context and asks a reflection question.

Example:

"A previous version of you wanted to revisit this decision. What has changed since then?"

The user describes what actually happened.

Step 6 — AI-Assisted Re-evaluation

Gemini compares:

Original Decision
        +
Original Assumptions
        +
User's New Experience
        +
Current Reflection
        ↓
New Context-Aware Insight

This helps the user understand how their thinking evolved.

🛠️ Technology Stack
Layer	Technology
Frontend	React / TypeScript
Backend	Node.js
AI	Google Gemini API
Authentication	Firebase Authentication
Database	Cloud Firestore
Secret Management	Google Cloud Secret Manager
Deployment	Google Cloud Run
Hosting Architecture	Google Cloud
Version Control	Git & GitHub
Development Environment	Google AI Studio
📁 Project Structure
DecideAI/
│
├── public/
│   └── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── ChatView.tsx
│   │   ├── DecisionSnapshot.tsx
│   │   ├── FutureCheckIn.tsx
│   │   └── Dashboard.tsx
│   │
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── gemini.ts
│   │   └── snapshotService.ts
│   │
│   ├── lib/
│   │   └── firebase.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── server.ts
│
├── firestore.rules
│
├── firebase-applet-config.json
│
├── .env.example
│
├── package.json
│
├── tsconfig.json
│
├── bun.lock
│
└── README.md
🔥 Firestore Security

Firestore security rules are configured to prevent cross-user data access.

Users can only access documents associated with their authenticated identity.

Conceptually:

Authenticated User A
        │
        ▼
Can Access
Only User A Data

Authenticated User B
        │
        ▼
Can Access
Only User B Data

This prevents unauthorized users from accessing another user's:

Conversations
Snapshots
Reflection notes
Future check-ins

The complete Firestore security rules are included in:

firestore.rules
⚙️ Local Setup
1. Clone the Repository
git clone https://github.com/YOUR-USERNAME/DecideAI.git
cd DecideAI
2. Install Dependencies
npm install

or, if using Bun:

bun install
3. Configure Environment Variables

Create a .env file based on .env.example.

cp .env.example .env

Configure the required Firebase and Google Cloud environment variables.

Example:

GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id

Never commit your actual .env file to GitHub.

4. Configure Firebase

Create or configure a Firebase project with:

Firebase Authentication
Cloud Firestore

Update the Firebase configuration for your local environment.

5. Configure Firestore Rules

Deploy the Firestore security rules:

firebase deploy --only firestore:rules

Verify that users cannot access documents belonging to other users.

6. Start the Application
npm run dev

or:

bun run dev

The application should now be available locally.

☁️ Google Cloud Run Deployment
Step 1 — Authenticate with Google Cloud
gcloud auth login
Step 2 — Select Your Project
gcloud config set project YOUR_PROJECT_ID
Step 3 — Build and Deploy

Deploy the application to Google Cloud Run.

Example:

gcloud run deploy decideai \
  --source . \
  --region YOUR_REGION \
  --allow-unauthenticated

For this challenge, ensure the required deployment configuration and service labels are applied.

🏷️ Cloud Run Challenge Label

The deployed service must include the required label:

dev-tutorial=cloud-run-ai-challenge

Verify the Cloud Run service configuration after deployment.

🔒 Production Secret Management

Production secrets should be stored in Google Cloud Secret Manager.

Example workflow:

Developer
     ↓
Secret Manager
     ↓
Cloud Run Service
     ↓
Secure Environment Variable
     ↓
Application

This prevents sensitive API keys from being directly included in:

Source code
GitHub repositories
Frontend application bundles
📊 Key Application Features
Decision Intelligence
Multi-turn AI conversations
Option comparison
Trade-off analysis
Priority identification
Structured decision summaries
Decision Snapshots

Stores:

Original thinking
Options considered
Key factors
Trade-offs
Biggest concern
Key insight
Suggested next step
Future Me Check-ins

Allows users to:

Schedule future reviews
Select review intervals
Add custom review dates
Revisit previous decisions
Reflect on actual outcomes
Receive context-aware AI analysis
🌟 Original Feature Enhancement
Future Me Check-in & Context-Aware Reflection

The original enhancement developed for DecideAI is the Future Me Check-in system.

A typical AI journal saves what a user said.

DecideAI goes further:

PAST
Original Conversation
        ↓
Decision Snapshot
        ↓
Future Check-in Scheduled
        ↓
PRESENT
Real-World Experience
        ↓
User Reflection
        ↓
Gemini Context Analysis
        ↓
FUTURE
Improved Decision-Making

The feature creates a bridge between a user's past assumptions and future reality.

This makes the application particularly useful for:

Career decisions
Education planning
Productivity improvement
Personal development
Goal evaluation
Long-term decision-making
📸 Screenshots
DecideAI Conversation

Decision Snapshot

Future Me Check-in Scheduling

Context-Aware Future Reflection

AI-Assisted Re-evaluation

🧪 Testing

The following functionality was tested:

Firebase Authentication
User conversation creation
Multi-turn Gemini responses
Decision Snapshot generation
Firestore data storage
User-level data isolation
Future Check-in scheduling
Custom review date selection
Future reflection conversations
Context-aware Gemini responses
Check-in completion workflow
🔐 Security Considerations

The application follows production-oriented security practices.

API Key Protection
No production API keys are hardcoded
Sensitive configuration is excluded from Git
Secrets are managed securely
Authentication
Users must authenticate before accessing private data
Firebase Authentication manages user identity
Firestore Isolation
User data is protected through Firestore security rules
Cross-user access is restricted
Production Deployment
Application is deployed through Google Cloud infrastructure
Secrets are separated from application source code
🎯 Learning Outcomes

This project demonstrates practical understanding of:

Generative AI application development
Gemini API integration
Multi-turn conversational systems
Firebase Authentication
Firestore data modeling
Database security rules
User data isolation
Secret management
Cloud-native deployment
Google Cloud Run
Context-aware AI workflows
Production-oriented AI application design
🔮 Future Improvements
Notifications

Future versions could include:

Email reminders
Push notifications
Calendar integration
Decision Timeline

Users could view their decisions across time:

Past Decision
      ↓
Reflection
      ↓
Outcome
      ↓
Lesson Learned
Decision Analytics

Potential analytics include:

Most common decision categories
Changes in user priorities
Decision confidence over time
Reflection patterns
Advanced AI Insights

Future AI capabilities could include:

Decision pattern analysis
Contradiction detection
Assumption tracking
Long-term personal insight summaries
👩‍💻 Author

Harini M

AI-Powered Decision Intelligence Project

Built for the Ideathon Challenge:

Build a Secure Personal Gemini Journal

📄 License

This project was created as a hackathon prototype and educational demonstration.


## Important: Before putting this on GitHub

You should create a `screenshots` folder and add your actual screenshots. For your project, I recommend these **five screenshots**:

1. **Main AI conversation**
2. **Decision Snapshot & Review**
3. **Future Me Check-in scheduling**
4. **Future Me Reflection Dialogue**
5. **Gemini's context-aware reflection response**

Your README is especially strong because the architecture and workflow clearly show:

**Firebase Authentication → Gemini conversation → Firestore storage → Decision Snapshot → Future Me Check-in → Context-aware AI reflection**

One caution: update the **exact filenames and commands** in the README if they differ from your actual repository. Since judges may run the deployment instructions, the README should match the real project structure exactly.
