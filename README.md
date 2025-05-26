# AdAlchemy

AdAlchemy is a web application that allows users to quickly generate promotional banners (e.g., "10% off on Coca Cola") with custom text and styles. The app stores the history of generated banners in a Firebase database for easy access and management. Banner images are generated using the Gemini API.

## Features

- **Custom Banner Generation:** Input your own promotional text and instantly create eye-catching banners.
- **AI-Powered Images:** Uses the Gemini API to generate banner images based on your input.
- **Banner History:** All generated banners are saved and can be viewed later.
- **Firebase Integration:** Securely stores banner history using Firebase Realtime Database or Firestore.
- **User-Friendly Interface:** Simple and intuitive UI for fast banner creation.

## Getting Started

### Prerequisites

- Node.js & npm
- Firebase account
- Gemini API key

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/adalchemy.git
    cd adalchemy
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up Firebase:
    - Create a Firebase project.
    - Add your Firebase config to the project (see `.env.example`).

4. Add your Gemini API key to your environment variables.

5. Start the development server:
    ```bash
    npm start
    ```

## Usage

1. Enter your promotional message and select banner options.
2. Click "Generate" to create your banner using the Gemini API.
3. View and manage your banner history.

## Technologies Used

- React (or your chosen frontend framework)
- Firebase (Authentication & Database)
- Gemini API (Image Generation)
- CSS/Styled Components

## License

This project is licensed under the MIT License.

---

*AdAlchemy — Effortless banner creation for your promotions!*