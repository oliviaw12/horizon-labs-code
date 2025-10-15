# LearnLLM UI/UX Design Overview

## Introduction

Purpose: The primary objective of this application is to allow students to leverage AI in a way that helps them internalize the content they learn in class rather than have AI do all the legwork and give them shortcuts to the answers. In addition, insights and data collected from students' interactions with the LLM can be viewed by instructors to better tailor their lessons and assist their students to optimize success.

Design Tool Used: Figma

Design Principles: Clarity, minimal cognitive load, accessibility, and responsive design.

## User Flow Summary

Entry Point: The user selects whether they are a instructor or a student and they are brought to the login/sign-up page (sign-up/authentication will be implenmented later on).
Core Flow: Choose Role → Login → Landing Page → New Chat Session → Prompt 1: Specific
                                                                 → Prompt 2: Vague
                                              → Previous Chat Session

## Frame-by-Frame Design Explanation

### Frame 1 - Choose Role Page

Purpose: This screen introduces users to the application and lets them choose whether to enter as a Student or Instructor.

Key Elements:
- Two large role cards with avatars and color-coded backgrounds (pink for Student, purple for Instructor).
- Supporting text clarifying role purpose.
- “Get Started” button at the bottom.

UX Explanation: By prompting role selection upfront, the system tailors the experience early on and keeps the flow streamlined. The contrasting colors improve recognition, while avatars add a friendly human touch.

### Frame 2 - Sign-In Page

Purpose: Authenticate the user and route them into the correct environment based on their selected role.

Key Elements:
- Input fields for username and password.
- Role selector confirmation below the form.
- “Sign In” button styled with brand color.

UX Explanation: A minimalist login form reduces distractions. The gentle purple gradient maintains visual consistency with the brand palette introduced in the previous screen.

### Frame 3 - Student Dashboard Page

Purpose: Provide students with quick access to primary tasks.

Key Elements:
- Greeting header: “Welcome Student.”
- Three primary action cards:
1. Start a New Session
2. Resume Last Session
3. Create a Customized Quiz

UX Explanation: This hub focuses on clarity and motivation. Each button is visually distinct (pink, purple, yellow) to help users identify their next step quickly.

### Frame 4 - New Chat Session Page

Purpose: Start an interaction with the AI tutor.

Key Elements:
- Input bar placeholder: “What do you want help with today?”
- Recommended Topics chip row (e.g., Math, Biology, History).
- Chat icon header with role indicator (“Student”).

UX Explanation: Encourages exploration while minimizing blank-state confusion by offering predefined topic suggestions. The interface mirrors modern chat layouts users already understand.

### Frame 5a - Prompt 1 - Specific

Purpose: Display AI and user messages during an active session with a specific prompt.

Key Elements:
- User message bubbles aligned right.
- AI responses aligned left with bot avatar.
- Typing indicator to signal processing.

UX Explanation: Familiar chat UX reduces learning curve. AI messages use slightly darker background to differentiate speaker roles.

### Frame 5b - Prompt 2 - Vague

Purpose: Display AI and user messages during an active session with a vague prompt.

Key Elements:
- User message bubbles aligned right.
- AI responses aligned left with bot avatar.
- Typing indicator to signal processing.

UX Explanation: Familiar chat UX reduces learning curve. AI messages use slightly darker background to differentiate speaker roles.

### Frame 6 - Previous Chat Session Page

Purpose: Allow returning users to pick up from their previous learning session.

Key Elements:
- Header: “Welcome back to your session!”
- Context reminder: “Last time you worked on HeapSort.”
- Two main options:
1. Resume Last Session
2. Start a New Session

UX Explanation: Respects user progress and supports learning continuity. Contextual reminders help users recall where they left off, promoting long-term engagement.