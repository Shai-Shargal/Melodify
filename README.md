# Melodify - Music Playlist Manager 🎵

## English

### Overview

Melodify is a modern web application that allows users to create and manage their music playlists. Users can add songs from YouTube, search for songs, and organize their favorite tracks in a beautiful and intuitive interface.

### Features

- 🔍 Search and add songs from YouTube
- 📝 Add songs directly via YouTube URL
- ⭐ Favorite/unfavorite songs
- 🎯 Edit song details (title, artist, notes)
- 🗑️ Delete songs from playlist
- 🎨 Modern, responsive UI with dark mode
- 🔐 Secure authentication system

### Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **API Integration**: YouTube Data API

### Getting Started

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database
- YouTube Data API key

#### Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd melodify
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Backend (.env):

```
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
YOUTUBE_API_KEY="your-youtube-api-key"
```

Frontend (.env):

```
REACT_APP_YOUTUBE_API_KEY="your-youtube-api-key"
```

4. Start the development servers:

```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

This project is licensed under the MIT License.

---

## עברית

### סקירה כללית

Melodify היא אפליקציית ווב מודרנית המאפשרת למשתמשים ליצור ולנהל את רשימות השמעה שלהם. המשתמשים יכולים להוסיף שירים מיוטיוב, לחפש שירים, ולארגן את השירים האהובים עליהם בממשק יפה ואינטואיטיבי.

### תכונות

- 🔍 חיפוש והוספת שירים מיוטיוב
- 📝 הוספת שירים ישירות דרך כתובת יוטיוב
- ⭐ סימון/ביטול סימון שירים כמועדפים
- 🎯 עריכת פרטי שירים (כותרת, אומן, הערות)
- 🗑️ מחיקת שירים מרשימת ההשמעה
- 🎨 ממשק משתמש מודרני ורספונסיבי עם מצב כהה
- 🔐 מערכת אימות מאובטחת

### טכנולוגיות

- **צד לקוח**: React, TypeScript, Material-UI
- **צד שרת**: Node.js, Express
- **בסיס נתונים**: PostgreSQL עם Prisma ORM
- **אימות**: JWT
- **שילוב API**: YouTube Data API

### התחלה מהירה

#### דרישות מקדימות

- Node.js (גרסה 14 ומעלה)
- npm או yarn
- בסיס נתונים PostgreSQL
- מפתח API של YouTube Data

#### התקנה

1. שכפל את המאגר:

```bash
git clone [כתובת-המאגר-שלך]
cd melodify
```

2. התקן את התלויות:

```bash
# התקן תלויות של השרת
cd backend
npm install

# התקן תלויות של הצד לקוח
cd ../frontend
npm install
```

3. הגדר משתני סביבה:

צד שרת (.env):

```
DATABASE_URL="כתובת-בסיס-הנתונים-שלך"
JWT_SECRET="מפתח-jwt-שלך"
YOUTUBE_API_KEY="מפתח-api-של-יוטיוב-שלך"
```

צד לקוח (.env):

```
REACT_APP_YOUTUBE_API_KEY="מפתח-api-של-יוטיוב-שלך"
```

4. הפעל את שרתי הפיתוח:

```bash
# הפעל את שרת השרת (מתיקיית backend)
npm run dev

# הפעל את שרת הצד לקוח (מתיקיית frontend)
npm start
```

### תרומה לפרויקט

תרומות יתקבלו בברכה! אתם מוזמנים לשלוח Pull Request.

### רישיון

פרויקט זה מופץ תחת רישיון MIT.
