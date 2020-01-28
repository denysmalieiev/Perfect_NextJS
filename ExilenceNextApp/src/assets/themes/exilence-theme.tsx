import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { grey, green, red, amber } from '@material-ui/core/colors';

const defaultTheme = createMuiTheme({ palette: { type: 'dark' } });

const primaryLight = '#e91e63';
const primaryMain = '#a31545';
const primaryDark = '#720e30';

export const primaryLighter = '#ff2e75';
export const primaryDarker = '#4a091f';

export const fontColors = {
  hintDarker: 'rgba(255, 255, 255, 0.2)'
}

export const secondary = {
  light: '#696969',
  main: '#282828',
  dark: '#000'
}

export const gridSpacing = 2;

export const cardColors = {
  primary: 'linear-gradient(90deg, #273238 0%, #1c262b 100%)',
  secondary: 'linear-gradient(90deg, #1d3e3b 0%, #192f2d 100%)', 
  third: 'linear-gradient(90deg, #14384a 0%, #082533 100%)'
};

export const rarityColors = {
  normal: '#c0c0c0',
  magic: '#8888FF',
  rare: '#EBEB57',
  unique: '#da7a36',
  gem: '#1ba29b',
  currency: '#AD904B',
  divination: '#c0c0c0',
  quest: '#6eb930'
};

export const itemColors = {
  chaosOrb: '#d6b600',
  corrupted: '#A40000'
};

export const statusColors = {
  success: green[800],
  warning: amber[900],
  info: grey[900],
  error: red[900]
};

export const currencyChangeColors = {
  positive: green[600],
  negative: red[700]
}

export const background = {
  default: '#191919',
  paper: '#202020'
};

export type Rarity = typeof rarityColors;
export type ItemColor = typeof itemColors;
export type StatusColor = typeof statusColors;

export const primaryGradient = `linear-gradient(90deg, ${primaryDark} 0%, ${primaryMain} 35%, ${primaryDarker} 100%)`;

export default function exilenceTheme() {
  return createMuiTheme({
    overrides: {
      MuiToolbar: {
        gutters: {
          [defaultTheme.breakpoints.up('xs')]: {
            paddingLeft: '8px',
            paddingRight: 0
          }
        }
      },
      MuiTableRow: {
        root: {
          '&$hover:hover': {
            backgroundColor: defaultTheme.palette.background.default
          }
        }
      },
      MuiTableCell: {
        root: {
          fontSize: '0.75rem'
        }
      },
      MuiFormControlLabel: {
        root: {
          color: secondary.light
        }
      }
    },
    palette: {
      primary: {
        light: primaryLight,
        main: primaryMain,
        dark: primaryDark
      },
      secondary: secondary,
      background: background,
      type: 'dark'
    },
    typography: {
      h6: {
        fontWeight: 400,
        fontSize: '1.15rem'
      }
    }
  });
}
