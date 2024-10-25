import { DefaultButton } from '@fluentui/react';
import React, { useState, useEffect } from 'react'
import ConfirmationDialog from './ConfirmationDialog';


// entityId: (context as IContext).page.entityId, 
// entityTypeName: (context as IContext).page.entityId,
// currentFieldName: (context as IContext).parameters.currentValue.attributes?.LogicalName, 
// webApi: this.context.webAPI 


const FormButtonComponent = (props: any) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const { buttonText, confirmationText, buttonActive, currentValue, onCurrentValueChange, entityId, entityTypeName, currentFieldName, webApi, isControlDisabled } = props;

  useEffect(() => {    
    if (isControlDisabled === true || buttonActive === false) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [buttonActive, isControlDisabled]);

  const handleButtonClick = () => {
    if (confirmationText !== null && confirmationText?.trim().length > 0) {
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
      <DefaultButton text={buttonText} onClick={handleButtonClick} disabled={isDisabled} />
      <ConfirmationDialog showConfirmationDialog={showConfirmationDialog} toggleShowConfirmationDialog={toggleShowConfirmationDialog} handleValueChange={handleValueChange} confirmationText={confirmationText} />
    </>
  )
}

export default FormButtonComponent