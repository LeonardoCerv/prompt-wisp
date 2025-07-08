
> 📖 🇪🇸 También disponible en español: [README.es.md](README.es.md)

![Prompt Wisp](/public/wisplogo.svg)

![Language](https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript&logoColor=white)
![Library](https://img.shields.io/badge/Library-React-4fccf3?logo=react&logoColor=white)
![Framework](https://img.shields.io/badge/Framework-NextJS-black?logo=nextdotjs&logoColor=white)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?logo=supabase&logoColor=white)
![Field](https://img.shields.io/badge/Field-Software%20Engineering-white)
![License](https://img.shields.io/badge/License-MIT-brown)

### ```Prompt Wisp``` is a platform to help you organize, manage, and share AI prompts.

### [Website](https://prompt-wisp.vercel.app/) • [Chrome extension repo](https://github.com/LeonardoCerv/prompt-wisp-web-extension) • [Live demo](https://prompt-wisp.vercel.app/prompt) • [Linkedin](https://www.linkedin.com/in/leonardocerv/) • [Gmail](mailto:Leocerva29@gmail.com)

![Prompt Wisp Preview](/public/preview1.png)
![Prompt Wisp Preview](/public/preview2.png)


## Overview

Prompt Wisp is a modern, full-stack application built to solve the growing challenge of prompt management in the AI era. It offers a professional platform for discovering, organizing, and sharing AI prompts, designed for both individuals and teams who demand excellence in their AI interactions.

## Features

### Core Capabilities
- **Prompt Management**: Create, edit, organize, and delete AI prompts with rich text support
- **Collections**: Group related prompts into collections for better organization
- **Sharing & Collaboration**: Share prompts publicly, privately, or with specific team members
- **Tagging System**: Categorize prompts with custom tags for efficient filtering
- **Search**: Powerful semantic search across your entire prompt library
- **Visibility Controls**: Set prompts as public, private, or unlisted
- **User Authentication**: Secure account creation and management with Supabase

## Technology Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API with custom hooks
- **Deployment**: Vercel

## Architecture

Prompt Wisp follows a modern architecture pattern with:

- Server-side rendering via Next.js for optimal performance and SEO
- API routes for backend functionality
- Typed data models using TypeScript interfaces
- Database schema with appropriate relationships and constraints
- Authentication flow with secure session management
- Responsive design for all devices

### Database Schema

The application uses a PostgreSQL database with the following core tables:
- `prompts`: Stores all prompt data including content, metadata, and visibility settings
- `collections`: Groups of prompts with their own metadata and visibility settings
- `users_prompts`: Manages relationships between users and prompts
- `users_collections`: Manages relationships between users and collections
- `collection_prompts`: Manages relationships between collections and prompts

## Development

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/prompt-wisp.git
cd prompt-wisp
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Access the application at http://localhost:3000

## Future Roadmap

### Planned Features

- **Real-time Collaboration**: Multiple users editing prompts simultaneously
- **Version History**: Track changes to prompts over time
- **AI Prompt Analysis**: Get insights and suggestions to improve your prompts
- **Advanced Permissions**: Granular access control for enterprise teams
- **API Access**: Programmatic access to your prompt library
- **Integration Ecosystem**: Connect with popular AI tools and platforms
- **Enhanced Analytics**: Track prompt performance and usage metrics
- **Custom Templates**: Create reusable prompt templates for common use cases
- **Mobile App**: Native mobile experience for on-the-go access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the [MIT License](LICENSE).