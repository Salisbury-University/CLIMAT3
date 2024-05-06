Hosted using firebase, run as a webpack

- Have to download node/modules before anything can run. Can't upload them to GitHub: npm install firebase
- All my code is in public and src, everything else is firebase related. 
- The google file is a google claim code so that google knows the website is owned by Karl aka tiei.cloud.org@gmail.com so it does not get flagged.
- Portal layout lands at index.html, and you can either go to climate folder or health folder or login/register.

Pages commented:
-index.html                 | main landing site
-404.html                   | error page
-login.html                 | login
-register.html              | very similar to login, adds to database
-climate/portal.html        | landing for climate portal
-climate/researchers.html   | displays climate researchers
-health/portal.html         | landing for health portal
-health/researchers.html    | displays health researchers
-databasetest.html          | test of "addDocument.js"
-addDocumentFunctions       | just add and show for now

Do not touch:
-bundle.js
-it recompiles itself when you run "npm run build"