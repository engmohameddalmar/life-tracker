# Life Tracker (MERN) - Morning and Night routines
Requires Node 18+ and MongoDB running locally (or put an Atlas URI in server/.env).

    npm run install:all
    npm run dev      # API :5000, app http://localhost:5173

Tracks 23 Aug 2026 to 22 Aug 2033 (2,557 days). Add a routine in client/src/routines.js and server/routines.js; it gets its own page and sidebar link.

## Upgrading from version 1
Version 1 stored morning entries without a routine field. If you already have data, run in mongosh:
    use life-tracker
    db.entries.updateMany({routine:{$exists:false}},{$set:{routine:"morning"}})
    db.entries.dropIndex("date_1")
