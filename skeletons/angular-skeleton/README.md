# Angular Skeleton Application

A minimal Angular application built with TypeScript. This serves as a starting point for building modern Angular applications, ideal for demonstrating how to use AI-assisted development tools to add new functionality.

## Features

- ✅ Angular 20 (LTS) with standalone components
- ✅ TypeScript strict mode
- ✅ Live reload for fast development
- ✅ Angular Signals for reactive state management
- ✅ Sample components demonstrating Angular patterns
- ✅ Docker and Docker Compose configuration
- ✅ Ready to add components using AI-assisted development

## Prerequisites

- Node.js 20+ (for local development)
- npm or yarn package manager
- Docker and Docker Compose (for containerized deployment)

## Setup and Installation

### Option 1: Local Development

#### 1. Navigate to Project Directory

```bash
cd skeletons/angular-skeleton
```

#### 2. Install Dependencies

```bash
npm install

# Or with yarn
yarn install
```

#### 3. Run the Development Server

```bash
npm start

# Or with yarn
yarn start
```

The application will start at `http://localhost:4200`

#### 4. Access the Application

Open your browser and navigate to `http://localhost:4200` to see the application running.

### Option 2: Docker Deployment

#### 1. Build and Run with Docker Compose

```bash
# Navigate to the project directory
cd skeletons/angular-skeleton

# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will start at `http://localhost:4200`

#### 2. Stop the Container

```bash
docker-compose down
```

## Project Structure

```
angular-skeleton/
├── public/
│   └── favicon.ico             # Application favicon
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── welcome.component.ts    # Sample component with state
│   │   │   ├── welcome.component.html  # Component template
│   │   │   └── welcome.component.css   # Component styles
│   │   ├── app.component.ts            # Main application component
│   │   ├── app.component.html          # Main component template
│   │   ├── app.component.css           # Main component styles
│   │   └── app.config.ts               # Application configuration
│   ├── index.html                      # HTML entry point
│   ├── main.ts                         # Angular application entry point
│   └── styles.css                      # Global styles and CSS variables
├── .gitignore                          # Git ignore rules
├── angular.json                        # Angular CLI configuration
├── docker-compose.yml                  # Docker Compose configuration
├── Dockerfile                          # Docker image definition
├── package.json                        # Node.js dependencies and scripts
├── README.md                           # This file
├── tsconfig.app.json                   # TypeScript configuration (app code)
└── tsconfig.json                       # TypeScript configuration (root)
```

## Adding New Components

This skeleton application is ready for you to add components. Use AI-assisted development tools to:

1. Generate new component files using Angular CLI
2. Create standalone components in `src/app/components/`
3. Import and use components in `AppComponent`

### Example: Creating a New Component

Create a new component using Angular CLI:

```bash
ng generate component components/hello-world --inline-style=false --inline-template=false
```

Or create manually `src/app/components/hello-world.component.ts`:

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  imports: [],
  template: `
    <div class="hello-world">
      <h2>Hello, {{ name }}!</h2>
      @if (age) {
        <p>You are {{ age }} years old.</p>
      }
    </div>
  `,
  styles: [`
    .hello-world {
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
  `]
})
export class HelloWorldComponent {
  @Input() name: string = 'World';
  @Input() age?: number;
}
```

Then import and use it in `app.component.ts`:

```typescript
import { HelloWorldComponent } from './components/hello-world.component';

@Component({
  selector: 'app-root',
  imports: [WelcomeComponent, HelloWorldComponent], // Add here
  // ...
})
```

And use in `app.component.html`:

```html
<app-hello-world [name]="'Alice'" [age]="30" />
```

## Verifying the Application

Once the application is running, you should see:

1. The Angular Skeleton Application header
2. A welcome message with an interactive counter button
3. Information cards about getting started
4. All text and styling properly rendered

Test the interactive features:

```bash
# Click the counter button
# You should see the count increment and messages appear
```

## Development Tips

- **Live Reload**: Changes to `.ts`, `.html`, and `.css` files automatically update in the browser
- **TypeScript Strict Mode**: Enabled to catch type errors during development. Check types with `npm run build`
- **Angular DevTools**: Install the Angular DevTools browser extension for debugging components and state
- **Component Organization**: Keep related components together. Create subdirectories for feature-specific components
- **Standalone Components**: This project uses standalone components (no NgModules). Import dependencies directly in component decorators
- **Angular Signals**: Use signals for reactive state management instead of traditional RxJS for simple cases
- **Angular CLI**: Use `ng generate` commands for consistent code scaffolding

## Building for Production

```bash
# Build optimized production bundle
npm run build

# The build output will be in the dist/angular-skeleton directory
# Production files are minified and optimized

# Preview production build locally
# First, install a static server if you don't have one
npm install -g http-server

# Then serve the dist directory
cd dist/angular-skeleton
http-server
```

The production build:

- Minifies JavaScript and CSS
- Optimizes images and assets
- Applies tree-shaking to remove unused code
- Performs Ahead-of-Time (AOT) compilation
- Generates source maps for debugging
- Creates optimized chunks for better caching

### Deploying Production Build

The `dist/angular-skeleton` directory contains static files that can be served with any static file server:

```bash
# Example with a simple static server
npx serve dist/angular-skeleton/browser

# Or deploy to Vercel, Netlify, AWS S3, Firebase Hosting, etc.
```

## Common Angular CLI Commands

```bash
# Install dependencies
npm install

# Start development server with live reload
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build --configuration production

# Generate a new component
ng generate component components/my-component
# or shorthand
ng g c components/my-component

# Generate a service
ng generate service services/my-service

# Generate a pipe
ng generate pipe pipes/my-pipe

# Run tests
npm test
# or
ng test

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Troubleshooting

### Port Already in Use

If port 4200 is already in use, you can change it in the `ng serve` command:

```bash
ng serve --port 3000
```

Or update `angular.json`:

```json
{
  "projects": {
    "angular-skeleton": {
      "architect": {
        "serve": {
          "options": {
            "port": 3000
          }
        }
      }
    }
  }
}
```

### Live Reload Not Working in Docker

The configuration in `angular.json` should already include polling:

```json
{
  "serve": {
    "options": {
      "host": "0.0.0.0",
      "poll": 2000
    }
  }
}
```

Also check that your `docker-compose.yml` has the correct volume mounts:

```yaml
volumes:
  - ./src:/app/src
  - ./angular.json:/app/angular.json
```

### TypeScript Errors

Run type checking to see all errors:

```bash
npm run build
```

Common fixes:

- Ensure all dependencies are installed: `npm install`
- Check that component imports are correctly defined
- Verify import paths are correct
- Make sure `tsconfig.json` settings are appropriate
- Ensure you're using the correct Angular decorator syntax

### Node Version Issues

Check your Node.js version:

```bash
node --version
```

This project requires Node.js 20 or higher. Update Node.js if needed:

- Use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`
- Use [volta](https://volta.sh/): `volta install node@20`
- Download from [nodejs.org](https://nodejs.org/)

### Module Not Found Errors

If you see "Cannot find module" errors:

1. Delete `node_modules/` and `package-lock.json`
2. Clear Angular cache: `rm -rf .angular/cache`
3. Reinstall dependencies: `npm install`
4. Restart the development server: `npm start`

### Build Fails

If the production build fails:

1. Check for TypeScript errors: `npm run build`
2. Ensure all imports are correct
3. Verify that all dependencies are properly installed
4. Check for circular dependencies
5. Clear cache and rebuild: `rm -rf .angular/cache && npm run build`

## Next Steps

1. **Add Routing**: Set up navigation between pages with Angular Router
   ```bash
   # Angular Router is already included, just configure routes in app.config.ts
   ```

2. **State Management**: Choose a state management solution
   - Angular Signals (built-in, recommended for simple apps)
   - NgRx (comprehensive, good for complex apps): `npm install @ngrx/store @ngrx/effects`
   - Akita (lightweight alternative): `npm install @datorama/akita`

3. **API Integration**: Add HTTP client for data fetching
   ```bash
   # HttpClient is built-in, just import provideHttpClient in app.config.ts
   ```

4. **UI Component Library**: Add a component library
   - Angular Material: `ng add @angular/material`
   - PrimeNG: `npm install primeng primeicons`
   - Ng-Bootstrap: `npm install @ng-bootstrap/ng-bootstrap`

5. **Form Handling**: Use Reactive Forms
   ```bash
   # Import ReactiveFormsModule in your components
   ```

6. **Testing**: Add test infrastructure
   - Jasmine/Karma (included by default)
   - Jest: `npm install -D jest @types/jest @angular-builders/jest`
   - Playwright: `npm install -D @playwright/test`

7. **Code Quality**: Add linting and formatting
   - ESLint: `ng add @angular-eslint/schematics`
   - Prettier: `npm install -D prettier eslint-config-prettier`

8. **Environment Variables**: Configure environment-specific settings
   - Use Angular's environment files
   - Create `src/environments/environment.ts` and `environment.development.ts`

9. **Error Handling**: Add global error handling
   - Implement ErrorHandler service
   - Add HTTP interceptors for API error handling

10. **Performance Optimization**: Improve loading times
    - Lazy load modules with Angular Router
    - Use OnPush change detection strategy
    - Implement virtual scrolling for long lists
    - Optimize bundle size with build analyzer

## Resources

- [Angular Documentation](https://angular.dev/)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Signals Guide](https://angular.dev/guide/signals)

## License

This is a template/example project for educational purposes.
