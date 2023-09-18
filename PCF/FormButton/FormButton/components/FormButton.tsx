import { DefaultButton } from '@fluentui/react';
import React, { useState } from 'react'
import ConfirmationDialog from './ConfirmationDialog';


// entityId: (context as IContext).page.entityId, 
// entityTypeName: (context as IContext).page.entityId,
// currentFieldName: (context as IContext).parameters.currentValue.attributes?.LogicalName, 
// webApi: this.context.webAPI 


const FormButtonComponent = (props: any) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const { buttonText, confirmationText, buttonActive, currentValue, onCurrentValueChange, entityId, entityTypeName, currentFieldName, webApi } = props;

  const handleButtonClick = () => {
    if (confirmationText?.trim().length > 0) {
      toggleShowConfirmationDialog();
    } else {
      handleValueChange();
    }
  }

  const toggleShowConfirmationDialog = () => {
    setShowConfirmationDialog(!showConfirmationDialog);
  }

  const handleValueChange = () => {
    let newValue = !currentValue;

    if (newValue === null || newValue === undefined) {
      newValue = true;
    }

    onCurrentValueChange(newValue);

    if (confirmationText?.trim().length > 0) {
      toggleShowConfirmationDialog();
    }
  }
  return (
    <>
      <DefaultButton text={buttonText} onClick={handleButtonClick} disabled={!buttonActive} />
      <ConfirmationDialog showConfirmationDialog={showConfirmationDialog} toggleShowConfirmationDialog={toggleShowConfirmationDialog} handleValueChange={handleValueChange} confirmationText={confirmationText} />
    </>
  )
}

export default FormButtonComponent