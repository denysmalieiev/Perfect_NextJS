import {
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  TextField
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MinuteFormat from '../../minute-format/MinuteFormat';
import useStyles from './NumberInputSetting.styles';

interface Props {
  value: number;
  handleChange: (value: number) => void;
  translationKey: string;
  requiresSnapshot?: boolean;
  minutes?: boolean;
  disabled?: boolean;
}

const NumberInputSetting: React.FC<Props> = ({
  value,
  handleChange,
  translationKey,
  requiresSnapshot,
  minutes,
  disabled
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <FormControl component="fieldset">
      <FormGroup>
        <FormLabel id={`${translationKey}-label`}>
          {t(`label.${translationKey}`)} {requiresSnapshot ? '*' : ''}
        </FormLabel>
        <TextField
          className={classes.root}
          id={`${translationKey}-label`}
          value={value}
          onChange={e => handleChange(+e.target.value)}
          InputProps={{
            inputComponent: MinuteFormat ? MinuteFormat : undefined
          }}
          disabled={disabled}
        ></TextField>
        <FormHelperText>{t(`helper_text.${translationKey}`)}</FormHelperText>
      </FormGroup>
    </FormControl>
  );
};

export default NumberInputSetting;
