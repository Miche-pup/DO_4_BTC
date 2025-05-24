# Do4BTC - Bitcoin Lightning Network Integration Platform

A modern web application built with Next.js, Supabase, and Lightning Network integration.

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Lightning Network Integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Lightning Network Configuration
   LIGHTNING_NODE_URL=your-lightning-node-url
   LIGHTNING_MACAROON=your-lightning-macaroon
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── (auth)/            # Authentication routes
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and configurations
│   ├── supabase/        # Supabase client and types
│   └── utils/           # Helper functions
└── types/               # TypeScript type definitions
```

## Development Guidelines

- Use TypeScript for type safety
- Follow the DRY principle
- Implement early returns
- Use Tailwind classes for styling
- Follow accessibility best practices
- Use const arrow functions
- Implement proper error boundaries

## License

MIT 