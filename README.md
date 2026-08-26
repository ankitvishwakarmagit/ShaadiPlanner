EazyWed: Where Elegance Meets Joy
EazyWed is a comprehensive wedding planning platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It simplifies the wedding planning process by providing tools for vendor booking, budget management, digital invitations, and personalized recommendations, making it easier for users to plan their special day with elegance and joy.


Features and Sub-Features
1. Vendor Booking and Management

Vendor Search and Filtering: Browse vendors by category, location, price, and ratings using intuitive search and filter tools.
Vendor Comparison: Compare vendor services, pricing, and reviews side-by-side to make informed decisions.
Booking System: Securely book vendors directly through the platform with integrated payment options.
Vendor Communication: Communicate with vendors via in-app messaging for seamless coordination.

2. Personalized Recommendations

AI-Driven Suggestions: Receive vendor recommendations tailored to user preferences, budget, and location using a recommendation engine.
Preference-Based Matching: Input wedding style, theme, and requirements to get curated vendor lists.
Dynamic Updates: Recommendations adapt as users update their preferences or budget.

3. Real-Time Budget Tracking

Budget Planner: Set and manage a wedding budget with categorized expense tracking (e.g., venue, catering, decor).
Real-Time Updates: Automatically update the budget as bookings are made or expenses are added.
Cost Estimation: View estimated costs for services based on vendor quotes and user selections.
Alerts and Insights: Receive alerts for overspending and insights for cost-saving opportunities.

4. Customizable Digital Invitations

Template Library: Choose from a variety of customizable wedding invitation templates.
Card Editor: Use a drag-and-drop editor to personalize text, images, and design elements.
Digital Delivery: Send invitations via email or WhatsApp with RSVP tracking.
Preview and Share: Preview designs in real-time and share with guests seamlessly.

5. User and Vendor Profiles

User Profiles: Manage wedding plans, track bookings, and save favorite vendors in a personalized dashboard.
Vendor Profiles: Showcase services, portfolios, pricing, and availability for potential clients.
Profile Customization: Update profile details, including photos, descriptions, and contact information.
Verification System: Ensure trust with verified vendor profiles and user accounts.

6. Feedback and Review System

Vendor Reviews: Rate and write reviews for vendors based on service quality and experience.
Review Moderation: Admin-moderated reviews to ensure authenticity and relevance.
Rating System: View aggregated vendor ratings to aid decision-making.
Feedback Loop: Vendors can respond to reviews to address concerns or thank clients.

7. AI-Customized Chatbot Assistance

24/7 Support: Access an AI-powered chatbot for instant assistance with platform navigation and queries.
Personalized Guidance: Get tailored advice on vendor selection, budget planning, and invitation design.
FAQ Integration: Quickly resolve common questions with pre-programmed responses.
Vendor Inquiry Support: Facilitate communication by drafting messages or queries to vendors.

Technology Stack

MongoDB: NoSQL database for storing application data.
Express.js: Web framework for building the backend API.
React.js: JavaScript library for building the user interface.
Node.js: JavaScript runtime for the backend server.

Installation and Setup
To set up EazyWed locally, follow these steps:
Prerequisites

Node.js: Version 14.x or higher recommended.
MongoDB: Locally installed or a cloud instance like MongoDB Atlas.
Git: For cloning the repository.

Cloning the Repository
Clone the EazyWed repository from GitHub:
git clone https://github.com/web-codings123/EazyWed.git
cd EazyWed

Backend Setup

Navigate to the backend directory:cd backend


Install backend dependencies:npm install


Set up environment variables:
Create a .env file in the backend directory.
Add the following variables (replace with your own values):PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number




Start the backend server:npm start

The backend server will run on http://localhost:5000 (or the port specified in .env).

Frontend Setup

Navigate to the frontend directory:cd ../eazywed


Install frontend dependencies:npm install


Set up environment variables:
Create a .env file in the eazywed directory.
Add the following variable:VITE_API_URL=http://localhost:5000




Start the frontend development server:npm run dev

The frontend will run on http://localhost:5173 (or the port assigned by Vite).

Importing the Project into Your IDE

Open your preferred IDE (e.g., VS Code).
Use the "Open Folder" option and select the EazyWed directory.
Ensure you have the necessary extensions installed (e.g., ESLint, Prettier for JavaScript/React development).

Running Both Servers
To run both the backend and frontend servers simultaneously:

Open two terminal windows.
In the first terminal, navigate to EazyWed/backend and run:npm start


In the second terminal, navigate to EazyWed/eazywed and run:npm run dev



Alternatively, use concurrently to run both servers with a single command:

Install concurrently globally (or add it to your project):npm install -g concurrently


From the root EazyWed directory, run:concurrently "cd backend && npm start" "cd eazywed && npm run dev"



Usage

Open your browser and navigate to http://localhost:5173 to access the EazyWed frontend.
Register as a user or vendor to explore features like booking vendors, creating digital invitations, or managing budgets.
Admin features are accessible via the admin dashboard (requires admin credentials).
Use the AI-customized chatbot (available on the platform) for assistance with navigation, vendor selection, or general queries.

Contributing
Contributions are welcome! To contribute:

Fork the repository:git fork https://github.com/web-codings123/EazyWed.git


Create a new branch:git checkout -b feature/your-feature-name


Make your changes and commit them:git commit -m "Add your feature description"


Push to your branch:git push origin feature/your-feature-name


Open a pull request on the GitHub repository.

If you encounter issues or have suggestions, please open an issue on the GitHub repository.
License
This project is licensed under the MIT License. See the LICENSE file for details.
