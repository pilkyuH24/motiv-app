# Motivation App

## 1. Description

The **Motivation App** is a web-based mission management system designed to help users set and track their personal goals, such as quitting smoking, exercising, sleeping early, and other self-improvement activities. Users can choose missions, log their progress, and earn rewards and badges based on their achievements. The app provides an intuitive interface with a calendar view, real-time mission updates, and personalized settings.

---

## 2. Features

### User Authentication
- Users can log in using **Google OAuth** (NextAuth integration).
- Secure session management using JWT tokens.

### Mission Management
- Users can browse a **list of predefined missions** (e.g., "Exercise Daily," "Read Books").
- Users can select missions and specify **start date, end date, and repetition type**:
  - **Daily**: Repeat every day.
  - **Weekly**: Repeat once per week.
  - **Monthly**: Repeat once per month.
  - **Custom**: Users can select specific days of the week.

### Mission Progress Tracking
- Users can **mark missions as completed** each day.
- A **calendar view** visually displays mission completion status.
- Mission logs are stored in a **PostgreSQL database** for historical tracking.

### Reward System
- Completing missions grants **reward points**.
- Points can be accumulated for **future rewards or achievements**.
- Users can earn **badges** based on their performance (e.g., "30-Day Streak").

### Dashboard & Data Visualization
- Users have a **dashboard** to manage their active missions.
- The dashboard provides **a list of ongoing and past missions**.
- Logs of completed missions are stored and visualized.

### Settings & Personalization
- Users can **customize their preferences** in a settings page.
- Stored in JSON format for **flexible configurations**.

---

## 3. Planned Improvements

### 1. **Optimize Loading Speed**
- Reduce initial API request time.
- Improve database indexing for faster queries.
- Implement caching mechanisms.

### 2. **Enhance Mission Completion Handling**
- Introduce an **undo feature** for mistakenly marked missions.
- Improve the mission completion **UI and confirmation messages**.

### 3. **Expand Badge System**
- Add more badges with **different difficulty levels**.
- Implement a **badge progress tracking system**.

### 4. **Introduce Notifications**
- **Reminders for upcoming missions** via push notifications or emails.
- Alerts for **streaks and achievements**.

### 5. **Improve Data Visualization**
- Display **progress charts** in the dashboard.
- Add **weekly and monthly reports**.

### 6. **Mobile Compatibility**
- Improve **responsive design** for seamless mobile usage.
- Consider developing a **mobile app version**.

---
[Visit The Website](https://motiv-app-ivory.vercel.app) 

![Alt text](/public/missions.png)
![Alt text](/public/dashboard.png)
