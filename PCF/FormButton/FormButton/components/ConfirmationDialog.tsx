import React, { useState } from 'react'
import { DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';
// import { useAppContext } from '../context/appContext'
// import { IWebApi } from '../models';


interface IConfirmationDialogProps {
  // action: string;
  // webApi: ComponentFramework.WebApi;
  confirmationText: string;
  showConfirmationDialog: boolean;
  toggleShowConfirmationDialog: () => void;
  handleValueChange: () => void;
}



const ConfirmationDialog = (props: IConfirmationDialogProps) => {
  const { showConfirmationDialog, toggleShowConfirmationDialog, handleValueChange, confirmationText } = props;

  const [loading, setLoading] = useState(false);

  // This is here so the action name can be added to the title dynamically
  const dialogContentProps = {
    type: DialogType.normal,
    title: 'Confirm',
    closeButtonAriaLabel: 'Close',
    subText: confirmationText,
  };

  // const handleConfirm = async () => {
  //   alert("Confirming....")
  // }

  return (
    <Dialog
      hidden={!showConfirmationDialog}
      onDismiss={toggleShowConfirmationDialog}
      dialogContentProps={dialogContentProps}
    // DialogProps={DialogProps}
    >
      <DialogFooter>
        {loading ? (
          <Spinner size={SpinnerSize.large} />
        ) : (
          <>
            <PrimaryButton onClick={handleValueChange} text="Yes" />
            <DefaultButton onClick={toggleShowConfirmationDialog} text="No" />
          </>
        )}
      </DialogFooter>
    </Dialog>
  )
}

export default ConfirmationDialog