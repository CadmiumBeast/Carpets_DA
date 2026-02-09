// Carpets.lk Theme Configuration
export const theme = {
  // Primary Colors - Green
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    
    // Background
    background: '#ffffff',
    backgroundGray: '#f7fafc',
    
    // Text
    textDark: '#1a202c',
    textGray: '#718096',
    textLight: '#a0aec0',
    
    // Borders
    border: '#e2e8f0',
    borderDark: '#cbd5e0',
    
    // Status Colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    light: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    green: '0 10px 25px rgba(16, 185, 129, 0.3)',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Typography
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export default theme;
