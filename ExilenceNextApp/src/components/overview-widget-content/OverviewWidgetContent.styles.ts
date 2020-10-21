import { makeStyles } from '@material-ui/core';

import {
  currencyChangeColors,
  fontColors,
  primaryLighter,
} from '../../assets/themes/exilence-theme';

const useStyles = makeStyles((theme) => ({
  iconWrapper: {},
  topContent: {
    borderBottom: `1px solid ${fontColors.hintDarker}`,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    textAlign: 'right',
  },
  title: {
    fontSize: '0.8rem',
  },
  secondary: {
    fontWeight: 'bold',
  },
  valueSuffix: {
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
  },
  currencyChange: {},
  positiveChange: {
    color: currencyChangeColors.positive,
  },
  negativeChange: {
    color: currencyChangeColors.negative,
  },
  tooltip: {
    maxWidth: 150,
  },
  clearBtn: {
    color: theme.palette.text.secondary,
  },
  clearIcon: {
    fontSize: '1.2rem',
  },
  inlineLink: {
    color: primaryLighter,
    cursor: 'pointer',
    textDecoration: 'none',
  },
}));

export default useStyles;
