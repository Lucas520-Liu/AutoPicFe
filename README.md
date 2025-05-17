# AI Image Generator

A Next.js application for generating images using AI, with Supabase authentication integration.

## Features

- User authentication with Supabase
- AI image generation with customizable dimensions
- Real-time status updates
- Modern UI with dark/light mode support
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- API endpoint for image generation

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=your-api-url
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-image-generator.git
cd ai-image-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables
4. Deploy

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI
- Framer Motion

## License

MIT 