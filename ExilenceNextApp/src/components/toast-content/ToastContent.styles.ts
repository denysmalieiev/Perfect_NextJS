import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  message: {},
  description: {
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
  },
}));

export default useStyles;
