# Carpets.lk - Branding & Theme Guide

## Brand Identity

**Application Name:** Carpets.lk  
**Tagline:** Sri Lanka's Premium Carpet Store  
**Logo:** `/public/images/logo.png`

## Color Palette

### Primary Colors
- **Primary Green:** `#10b981` - Main brand color
- **Dark Green:** `#059669` - Hover states, dark accents
- **Light Green:** `#34d399` - Light accents, highlights

### Neutral Colors
- **White:** `#ffffff` - Primary background
- **Light Gray:** `#f7fafc` - Secondary background
- **Dark Text:** `#1a202c` - Primary text
- **Gray Text:** `#718096` - Secondary text
- **Light Gray Text:** `#a0aec0` - Tertiary text
- **Border Gray:** `#e2e8f0` - Borders

### Status Colors
- **Success:** `#10b981` (Green)
- **Error:** `#ef4444` (Red)
- **Warning:** `#f59e0b` (Amber)
- **Info:** `#3b82f6` (Blue)

## Typography

**Font Family:** system-ui, Avenir, Helvetica, Arial, sans-serif

### Font Sizes
- Extra Small: `12px`
- Small: `14px`
- Base: `16px`
- Large: `18px`
- XL: `20px`
- 2XL: `24px`
- 3XL: `30px`

### Font Weights
- Normal: `400`
- Medium: `500`
- Semibold: `600`
- Bold: `700`

## Design Elements

### Gradients
```css
/* Primary Gradient */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Light Gradient */
background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
```

### Shadows
```css
/* Small */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Large */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Green Glow */
box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
```

### Border Radius
- Small: `4px`
- Medium: `8px`
- Large: `12px`
- XL: `16px`
- Full: `9999px`

## Usage

### CSS Variables
The theme is defined in [src/index.css](client/src/index.css):
```css
:root {
  --primary-green: #10b981;
  --primary-green-dark: #059669;
  --primary-green-light: #34d399;
  --background-white: #ffffff;
  --text-dark: #1a202c;
  --text-gray: #718096;
  --border-gray: #e2e8f0;
}
```

### JavaScript Theme Object
Import the theme configuration in your components:
```javascript
import theme from './theme';

const MyComponent = () => {
  return (
    <button style={{
      backgroundColor: theme.colors.primary,
      color: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md
    }}>
      Click Me
    </button>
  );
};
```

### Using in Styled Components
```javascript
import styled from 'styled-components';
import theme from './theme';

const Button = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
    box-shadow: ${theme.shadows.green};
  }
`;
```

## Components with Branding

### Authentication Pages
- [Login](client/src/auth/login.jsx) - Displays logo and brand colors
- [Signup](client/src/auth/signup.jsx) - Customer registration with branding
- [Auth Styles](client/src/auth/auth.css) - Green gradient theme

### Logo Usage
```jsx
<img src="/images/logo.png" alt="Carpets.lk" />
```

## Accessibility

- Maintain minimum contrast ratio of 4.5:1 for text
- Primary green (#10b981) on white background: ✓ Passes WCAG AA
- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works

## Brand Voice

- **Professional yet approachable**
- **Quality-focused**
- **Customer-centric**
- **Trustworthy**

### Tone Examples
✓ "Welcome to Carpets.lk - Sri Lanka's trusted carpet experts"  
✓ "Discover premium quality carpets for your home"  
✓ "Your satisfaction is our priority"  

✗ Avoid overly casual language  
✗ Avoid aggressive sales tactics  

## Page Titles

Format: `[Page Name] - Carpets.lk`

Examples:
- `Home - Carpets.lk - Premium Carpet Store`
- `Login - Carpets.lk`
- `Shop Carpets - Carpets.lk`
- `Admin Dashboard - Carpets.lk`

## Favicon

Located at: `/public/images/logo.png`

Referenced in [index.html](client/index.html):
```html
<link rel="icon" type="image/png" href="/images/logo.png" />
```

## Future Enhancements

- [ ] Create loading animation with brand colors
- [ ] Design email templates with branding
- [ ] Create social media graphics
- [ ] Design print materials (business cards, flyers)
- [ ] Create brand guidelines PDF
- [ ] Develop mobile app theme
- [ ] Create dark mode variant (optional)
