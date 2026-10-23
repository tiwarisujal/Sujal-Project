# CareTrack Pro — Facility Command Center

A multi-file, responsive static prototype for the FactWise TPM assessment.

## Files
- `index.html` — semantic app structure and screens
- `styles.css` — full visual system, responsive layout, light/dark themes
- `app.js` — demo data, workflows, validation and interactions
- `README.md` — deployment and limitations

## Run locally
Open `index.html` in a modern browser. Internet is only needed for the optional Google Fonts; the app itself is static.

## Deploy on Vercel
1. Upload these three files to a Git repository.
2. Import the repository in Vercel.
3. Select Framework Preset: Other.
4. Build command: leave blank / none.
5. Output directory: `.` (project root).
6. Deploy, then test the public URL and paste it into the assessment PDF.

## Demo features
- Light/dark theme toggle (preference remembered when browser storage is available)
- Responsive dashboard, occupancy and daily workflow progress
- Patient directory with search and filters
- Nurse temperature recording; routine duplicate prevention; repeat readings require a reason
- Doctor visit completion depends on today's routine temperature record
- Admin admission workflow with duplicate ID/room and 74-bed capacity checks
- Discharge eligibility queue based on three complete consecutive recorded no-fever days
- Outcomes and mortality benchmark view
- CSV export of active patient records

## Important limitations
Illustrative sample data only. State changes are in browser memory and reset on refresh. This is not a production medical application and must not be used for real patient care. A production version needs authentication, role-based access, a secure backend/database, persistent audit trails, server-side validation, backups, privacy controls, and clinical governance review. Fever threshold is a demo configuration and must be set by the facility's approved protocol.
