# Component Organization Guide

## Overview
This document outlines the organization structure for components in the Mystic Tours project to maintain clean, scalable, and maintainable code.

## Directory Structure

```
components/
├── ui/                    # Reusable UI components (Radix UI, buttons, inputs, etc.)
├── forms/                 # Form components (booking forms, contact forms, etc.)
├── dialogs/               # Modal and dialog components
├── admin/                 # Admin-specific components
├── layout/                # Layout components (navbar, footer, headers)
└── features/              # Feature-specific components (tour cards, testimonials, etc.)
```

## Component Categories

### UI Components (`components/ui/`)
- **Purpose**: Reusable, generic UI components
- **Examples**: Buttons, inputs, cards, modals, dropdowns
- **Rules**: 
  - Must be highly reusable
  - Should accept props for customization
  - No business logic
  - Based on Radix UI primitives

### Form Components (`components/forms/`)
- **Purpose**: Form-specific components with business logic
- **Examples**: TourBookingForm, ContactForm, AirportPickupForm
- **Rules**:
  - Handle form state and validation
  - Include form submission logic
  - Use React Hook Form + Zod validation
  - Keep under 300 lines or break into sub-components

### Dialog Components (`components/dialogs/`)
- **Purpose**: Modal and dialog components
- **Examples**: Confirmation dialogs, booking confirmations
- **Rules**:
  - Handle modal state and animations
  - Include proper accessibility attributes
  - Use consistent styling patterns

### Admin Components (`components/admin/`)
- **Purpose**: Admin dashboard specific components
- **Examples**: AdminNavbar, admin tables, admin forms
- **Rules**:
  - Only used in admin sections
  - Include admin-specific styling
  - Handle admin authentication/authorization

### Layout Components (`components/layout/`)
- **Purpose**: Page layout and navigation components
- **Examples**: Navbar, Footer, PageHeader, Hero
- **Rules**:
  - Used across multiple pages
  - Handle responsive design
  - Include navigation logic

### Feature Components (`components/features/`)
- **Purpose**: Feature-specific components
- **Examples**: TourCard, Testimonial, JamaicaSlideshow
- **Rules**:
  - Specific to particular features
  - Can include business logic
  - Should be focused and single-purpose

## Import Patterns

### Using Index Files
Each directory should have an `index.ts` file for clean imports:

```typescript
// components/forms/index.ts
export { TourBookingForm } from './tour-booking-form';
export { ContactForm } from './contact-form';
export { AirportPickupForm } from './airport-pickup-form';

// Usage
import { TourBookingForm } from '@/components/forms';
```

### Import Order
1. React/Next.js imports
2. Third-party library imports
3. Internal component imports
4. Relative imports

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TourBookingForm } from '@/components/forms';
import { Navbar } from '@/components/layout';
import './styles.css';
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `TourBookingForm.tsx`)
- **Utilities**: camelCase (e.g., `formValidation.ts`)
- **Types**: PascalCase (e.g., `BookingTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Component Guidelines

### Size Limits
- **Small**: < 100 lines
- **Medium**: 100-300 lines
- **Large**: > 300 lines (should be refactored)

### Props Interface
Always define TypeScript interfaces for component props:

```typescript
interface TourCardProps {
  tour: Tour;
  onBook?: (tourId: string) => void;
  className?: string;
}

export function TourCard({ tour, onBook, className }: TourCardProps) {
  // Component implementation
}
```

### Error Handling
Include proper error boundaries and loading states:

```typescript
export function TourBookingForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BookingData) => {
    try {
      setLoading(true);
      setError(null);
      // Submit logic
    } catch (err) {
      setError('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
}
```

## Migration Guide

When moving components to new locations:

1. **Update imports** in all files that use the component
2. **Update index.ts** files in affected directories
3. **Test functionality** to ensure nothing breaks
4. **Update documentation** if needed

## Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use component composition for flexibility
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Error Boundaries**: Include proper error handling
5. **Accessibility**: Include proper ARIA attributes and keyboard navigation
6. **Performance**: Use React.memo for expensive components
7. **Testing**: Write tests for complex components

## Examples

### Good Component Structure
```typescript
// components/features/TourCard.tsx
interface TourCardProps {
  tour: Tour;
  onBook: (tourId: string) => void;
}

export function TourCard({ tour, onBook }: TourCardProps) {
  return (
    <div className="tour-card">
      <img src={tour.image} alt={tour.title} />
      <h3>{tour.title}</h3>
      <p>{tour.description}</p>
      <Button onClick={() => onBook(tour.id)}>
        Book Now
      </Button>
    </div>
  );
}
```

### Index File Example
```typescript
// components/features/index.ts
export { TourCard } from './TourCard';
export { Testimonial } from './Testimonial';
export { JamaicaSlideshow } from './JamaicaSlideshow';
```

This organization ensures the codebase remains maintainable, scalable, and easy to navigate as the project grows. 