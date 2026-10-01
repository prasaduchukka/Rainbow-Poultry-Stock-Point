# Rainbow Poultry Stock Point — Latest Sync

Updated to match the latest Vijayalakshmi workflow changes requested for this project.

## Included
- Unique Rainbow login page with the Rainbow logo and a subtle full-screen background video layer.
- Login video URL: `/assets/bg_video.mp4`.
- Purchase form no longer asks for Company Name or Total Loaded Weight when starting a new trip. Purchase Weight is used as the trip loaded weight.
- Trip Details shows the existing Company value and the Supplier name directly underneath it.
- Vehicle Trip History also shows Supplier underneath Company.
- Deleting a purchase removes its supplier-ledger entry. If that purchase is the last purchase on its trip, the linked trip, deliveries, customer-ledger delivery entries, and vehicle trip history are removed as well.
- Delivered birds can be less than or equal to purchased birds; Save & Finish no longer requires exact equality.
- Static asset access explicitly permits `/assets/**`.
- Missing static resources now return HTTP 404 instead of being turned into a generic HTTP 500 by the global exception handler.

## Background video setup
The actual MP4 is not embedded in this archive because it is a local file outside the uploaded Rainbow project. Copy the existing video into:

`backend/src/main/resources/static/assets/bg_video.mp4`

See `VIDEO_SETUP.txt` for the Windows copy command and verification steps.

## Verification
- All frontend JavaScript files passed `node --check` syntax validation.
- Maven compilation could not be run in this environment because Maven is not installed here.
