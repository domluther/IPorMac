# Quick Reference: Template APIs & Patterns

## TanStack React Router

### Basic Route Creation
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div>About page</div>
}
```

### Dynamic Routes
```tsx
// File: src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: Post,
})

function Post() {
  const { postId } = Route.useParams()
  return <div>Post ID: {postId}</div>
}
```

### Route with Loader
```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    return fetch(`/api/users/${params.userId}`).then(r => r.json())
  },
  component: User,
})

function User() {
  const user = Route.useLoaderData()
  return <div>{user.name}</div>
}
```

### Navigation
```tsx
import { Link } from '@tanstack/react-router'

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/posts/$postId" params={{ postId: '123' }}>Post 123</Link>
    </nav>
  )
}
```

### Programmatic Navigation
```tsx
import { useNavigate } from '@tanstack/react-router'

function MyComponent() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate({ to: '/about' })
  }
  
  return <button onClick={handleClick}>Go to About</button>
}
```

## Styling with Tailwind

### Basic Classes
```tsx
<div className="p-4 text-white bg-blue-500 rounded-lg shadow-md">
  Content
</div>
```

### Conditional Classes with cn()
```tsx
import { cn } from '@/lib/utils'

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    />
  )
}
```

### Using Class Variance Authority
```tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Testing Patterns

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Testing with Router
```tsx
import { createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'

function renderWithRouter(component, initialEntries = ['/']) {
  const history = createMemoryHistory({ initialEntries })
  return render(
    <Router history={history}>
      {component}
    </Router>
  )
}

it('navigates correctly', () => {
  renderWithRouter(<MyComponent />)
  // Test navigation...
})
```

### Mocking
```tsx
import { vi } from 'vitest'

// Mock a module
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'John' })
}))

// Mock a function
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')
expect(mockFn).toHaveBeenCalledWith('expected arg')
```

## Common Hooks & Utilities

### State Management
```tsx
import { useState, useEffect, useReducer } from 'react'

// Simple state
const [count, setCount] = useState(0)

// Object state
const [user, setUser] = useState({ name: '', email: '' })
setUser(prev => ({ ...prev, name: 'John' }))

// Reducer for complex state
const [state, dispatch] = useReducer(reducer, initialState)
```

### Effect Patterns
```tsx
// Component mount
useEffect(() => {
  console.log('Component mounted')
}, [])

// Dependency-based effect
useEffect(() => {
  fetchData(userId)
}, [userId])

// Cleanup
useEffect(() => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer)
}, [])
```

### Custom Hooks
```tsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}
```

## TypeScript Patterns

### Component Props
```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
}

function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}
```

### Generic Components
```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

### API Types
```tsx
interface User {
  id: string
  name: string
  email: string
}

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

## Build & Development

### Available Scripts
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests (watch mode)
npm run test:run   # Run tests once
npm run test:ui    # Visual test runner
npm run lint       # Check code quality
npm run format     # Format code
npm run type-check # TypeScript checking
```

### Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=My App
```

```tsx
// Access in code
const apiUrl = import.meta.env.VITE_API_URL
```

## Icons (Lucide React)
```tsx
import { Home, User, Settings } from 'lucide-react'

function Navigation() {
  return (
    <nav>
      <Home className="w-5 h-5" />
      <User size={20} />
      <Settings className="w-4 h-4 text-gray-500" />
    </nav>
  )
}
```
