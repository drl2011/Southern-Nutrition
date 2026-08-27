SOUTHERN NUTRITION — CLOUDFLARE + SQUARE SETUP
================================================
Domain: GetSouthernNutrition.com

WHAT IS ALREADY BUILT
- Custom Southern Nutrition menu / cart
- Pickup or delivery selection
- Address, requested time, order notes
- Embedded Square Web Payments card form
- Cloudflare Pages Function that securely calls Square's Payments API
- Server-side price validation so customers cannot change prices in their browser
- Square Sandbox / Production switch
- Basic local rewards profile placeholder

IMPORTANT
The package is intentionally set to Square SANDBOX first. No real card should be charged until you intentionally switch to production.
Never place SQUARE_ACCESS_TOKEN in index.html, app.js, GitHub, or any public file.

CLOUDFLARE ENVIRONMENT VARIABLES / SECRETS
In Cloudflare -> Workers & Pages -> your project -> Settings -> Variables and Secrets, add:

SQUARE_APPLICATION_ID   = your Square Sandbox Application ID
SQUARE_LOCATION_ID      = your Square Sandbox Location ID
SQUARE_ENVIRONMENT      = sandbox
SQUARE_ACCESS_TOKEN     = your Square Sandbox Access Token  [ENCRYPT THIS AS A SECRET]

The first 3 are configuration values. The ACCESS TOKEN must be encrypted as a Cloudflare secret.

DEPLOYMENT
The folder is structured for Cloudflare Pages. Deploy through Git integration or Wrangler so the /functions directory is included.

After deployment, open:
https://YOUR-SITE.pages.dev/api/config

It should say configured:true after the variables above are added.
Then open the website. The checkout should say:
"Square Sandbox connected — test payments only"

CUSTOM DOMAIN
After the Pages project works on pages.dev:
Cloudflare -> Workers & Pages -> your project -> Custom domains -> Set up a custom domain
Enter: GetSouthernNutrition.com
Also add: www.GetSouthernNutrition.com
Cloudflare owns the domain/DNS already, so this part should be straightforward.

GOING LIVE LATER
Only after Sandbox checkout works:
1. Put your Production Square Application ID and Location ID into Cloudflare.
2. Replace SQUARE_ACCESS_TOKEN with your Production token, still encrypted.
3. Change SQUARE_ENVIRONMENT from sandbox to production.
4. Redeploy if Cloudflare requests it and test with a real low-dollar transaction.

NEXT BUILD ITEMS
- Replace sample menu with the real Southern Nutrition menu and options.
- Add modifiers / flavor selections.
- Add delivery minimum, delivery fee, delivery zone, and operating hours.
- Connect Square Orders API so paid orders appear as itemized Square orders.
- Connect Square Customers + Loyalty for true Buy 9 / Get 10th Free tracking.
- Add SMS/email order alerts and sold-out controls.
