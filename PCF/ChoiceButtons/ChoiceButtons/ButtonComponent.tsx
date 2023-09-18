import React from 'react'
import { IOptionSetOption } from './ChoiceButtons'
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';

interface IButtonComponentProps {
    optionsetValue: IOptionSetOption
    selectedValue: number | null
    handleValueChange: (value: number | null) => void;
    primaryButtonBackground: string;
    secondaryButtonBackground: string;
}

const ButtonComponent = (props: IButtonComponentProps) => {
    const {optionsetValue, selectedValue, handleValueChange, primaryButtonBackground, secondaryButtonBackground} = props;
    
    const handleButtonClick = () => {
        // If the value is already selected, clear the value if it's clicked again
        if(selectedValue === optionsetValue.Value) {
            handleValueChange(null)
        } else {
            handleValueChange(optionsetValue.Value)
        }
    }

    let component = <DefaultButton text={optionsetValue.Label}  style={{ background: secondaryButtonBackground}} onClick={handleButtonClick} />
    if(selectedValue === optionsetValue.Value) {
        component = <PrimaryButton text={optionsetValue.Label} style={{ background: primaryButtonBackground }} onClick={handleButtonClick} />
    }

  return component
}

export default ButtonComponent