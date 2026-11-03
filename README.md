BEILO — E-commerce Platform

A modern e-commerce platform for Beilo, a fashion retail store specialising in clothing, footwear and accessories.

The platform is designed to bring Beilo's physical retail experience online, making it easier for customers to discover products, explore available sizes and colours, check prices, and place orders through WhatsApp.

---

1. Project Overview

Beilo is an e-commerce platform designed to improve how the business showcases and sells its products online.

Currently, Beilo uses social media platforms such as Facebook, TikTok and WhatsApp to showcase products and communicate with customers.

As the product catalogue grows, finding specific products, checking prices and confirming availability through social media becomes increasingly difficult.

This platform aims to centralise product discovery and create a more organised online shopping experience.

Project Objectives

- Establish a central online storefront for Beilo.
- Make products easier to discover and browse.
- Display product prices, sizes, colours and available variants.
- Improve the customer shopping experience.
- Simplify order enquiries through WhatsApp.
- Provide an administrative system for managing products and store content.
- Support the business as its product catalogue grows.

---

2. Key Features

Customer-facing Storefront

- Modern, responsive shopping interface.
- Product catalogue and category browsing.
- Product search and discovery.
- Promotional banners and featured collections.
- Product detail pages.
- Product pricing.
- Size and colour variations.
- Deals and promotional sections.
- Shopping cart.
- WhatsApp-based ordering.

Administration Dashboard

The administrative interface is intended for authorised Beilo staff.

Planned functionality includes:

- Secure staff authentication.
- Product management (Create, Read, Update, Delete).
- Category management.
- Product image management.
- Size and colour variant management.
- Inventory and stock availability.
- Order management.
- Promotional content management.

Customer Experience

The storefront is designed to allow customers to browse products without creating an account.

Customers can discover products, select their preferred options and proceed to place orders through WhatsApp.

---

3. Technology Stack

Technology| Purpose
Next.js| Application framework
React| User interface
TypeScript| Type safety
Tailwind CSS| Styling
Supabase| Backend infrastructure
PostgreSQL| Database
Supabase Auth| Staff authentication
Supabase Storage| Product image storage
Lucide React| Icons

---

4. Project Structure

The project follows a modular structure to keep the application organised and maintainable.

beilo-store/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── categories/
│   │   ├── products/
│   │   └── stores/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── login/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   ├── products/
│   ├── categories/
│   ├── banners/
│   ├── cart/
│   ├── ui/
│   └── admin/
│
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── constants/
│
├── hooks/
├── types/
├── public/
│   ├── images/
│   └── icons/
│
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
│
├── README.md
├── package.json
└── tsconfig.json

Note: The structure above describes the intended organisation. Adjust it to match the actual project as development progresses.

---

5. Getting Started

Prerequisites

Make sure you have the following installed:

- Node.js
- npm, pnpm, yarn or bun
- Git

Installation

Clone the repository:

git clone <repository-url>

Navigate into the project:

cd beilo-store

Install dependencies:

npm install

Environment Variables

Create a ".env.local" file in the root directory.

Add the required environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Never commit environment files containing secrets or private credentials.

Run Development Server

npm run dev

Open:

http://localhost:3000

The application will automatically update when you make changes to the source files.

---

6. Authentication & Access Control

The public storefront does not require customer registration.

Administrative access is restricted to authorised Beilo personnel.

- No public administrator registration.
- Staff accounts must be provisioned by an authorised administrator.
- Administrative operations require authentication.
- Database access must be protected using Supabase Row Level Security (RLS).

---

7. Design Principles

The platform follows these design principles:

Simplicity: Make shopping straightforward and intuitive.

Discoverability: Help customers find products without scrolling through thousands of social media posts.

Consistency: Maintain a consistent visual identity throughout the platform.

Responsiveness: Ensure the experience works across mobile phones, tablets and desktops.

Scalability: Build a foundation that can support a growing product catalogue and multiple staff members.

---

8. Development Guidelines

When contributing to this project:

1. Follow the existing project architecture.
2. Reuse existing components where possible.
3. Keep components modular and maintainable.
4. Use TypeScript for application development.
5. Avoid unnecessary dependencies.
6. Keep business logic separate from presentation where appropriate.
7. Validate user input.
8. Protect sensitive operations through server-side authorization and database policies.
9. Test changes before considering features complete.
10. Update documentation when significant architectural decisions change.

---

9. Project Status

Development: In Progress

The project is being developed in stages.

Area| Status
Storefront layout| Completed
Header and navigation| Completed
Promotional banners| Completed
Deals section| Completed
Categories page| Completed
Product catalogue| In progress
Product detail functionality| Pending
Shopping cart| Pending
WhatsApp ordering| Pending
Admin dashboard| Pending
Database integration| Pending
Authentication| Pending
Inventory management| Pending
Production deployment| Pending

---

10. Future Improvements

Potential future enhancements include:

- Integration with existing inventory/POS software.
- Real-time stock availability.
- Advanced product filtering.
- Sales analytics.
- Order tracking.
- Multiple staff roles and permissions.
- Improved promotional management.
- Online payment integration.

---

11. Project Vision

Beilo is more than a digital catalogue.

The goal is to create a centralised digital storefront that improves product discovery, reduces friction between customers and the business, and provides a foundation for Beilo's continued growth.

---

Project: Beilo Store
Type: E-commerce Platform
Status: In Development
Framework: Next.js