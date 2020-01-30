import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@material-ui/core';
import CasinoIcon from '@material-ui/icons/CasinoRounded';
import { AxiosError } from 'axios';
import { Formik } from 'formik';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { generateGroupName } from '../../utils/group.utils';
import PasswordField from '../password-field/PasswordField';
import RequestButton from '../request-button/RequestButton';
import SimpleField from '../simple-field/SimpleField';
import useStyles from './GroupDialog.styles';
import { IGroupForm } from './GroupDialogContainer';

interface Props {
  show: boolean;
  initialValues: IGroupForm;
  dialogType: 'create' | 'join' | undefined;
  onClose: () => void;
  onSubmit: (group: IGroupForm) => void;
  handleGroupExists: (groupName: string) => void;
  handleClearError: () => void;
  loading: boolean;
  groupError?: AxiosError | Error;
  groupExists?: boolean;
}

const GroupDialog: React.FC<Props> = ({
  show,
  onClose,
  onSubmit,
  initialValues,
  groupError,
  groupExists,
  dialogType,
  handleGroupExists,
  handleClearError,
  loading
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const validationSchema = Yup.object<IGroupForm>().shape({
    name: Yup.string().required(t('label.required')),
    password: Yup.string().min(6)
  });

  const getGroupExistsError = () => {
    switch (dialogType) {
      case 'create':
        return groupExists !== undefined && groupExists
          ? t('error:group_already_exists')
          : undefined;
      case 'join':
        return groupExists !== undefined && !groupExists
          ? t('error:group_not_found')
          : undefined;
      default:
        return undefined;
    }
  };

  return (
    <Dialog open={show} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={values => onSubmit(values)}
        validationSchema={validationSchema}
      >
        {({ isValid, dirty, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {t(`title.${dialogType}_group_dialog_title`)}
            </DialogTitle>
            <DialogContent>
              <SimpleField
                name="name"
                type="text"
                label={t('label.group_name')}
                placeholder={t('label.group_name_placeholder')}
                endIcon={
                  dialogType === 'create' ? (
                    <IconButton
                      aria-label="generate"
                      title={t('label.generate_name_icon_title')}
                      className={classes.helperIcon}
                      edge="start"
                      size="small"
                      onClick={() => {
                        const name = generateGroupName();
                        setFieldValue('name', name);
                        handleGroupExists(name);
                      }}
                    >
                      <CasinoIcon />
                    </IconButton>
                  ) : (
                    undefined
                  )
                }
                customError={getGroupExistsError()}
                handleBlur={handleGroupExists}
                required
                autoFocus
              />
              <PasswordField
                name="password"
                label={t('label.password')}
                handleOnChange={() => handleClearError()}
                customError={groupError ? t(groupError.message) : undefined}
                placeholder={t('label.password_placeholder')}
                helperText={t('label.password_helper_text')}
              />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button onClick={onClose}>{t('action.close')}</Button>
              <RequestButton
                type="submit"
                disabled={
                  loading || !isValid || getGroupExistsError() !== undefined
                }
                color="primary"
                variant="contained"
                loading={loading}
              >
                {t(`action.${dialogType}_group`)}
              </RequestButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

export default observer(GroupDialog);
