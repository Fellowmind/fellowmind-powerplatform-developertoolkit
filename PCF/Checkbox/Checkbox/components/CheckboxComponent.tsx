import React, { useState, useEffect, FormEvent } from 'react'
import { Checkbox } from '@fluentui/react';

interface ICheckboxComponentProps {
    onValueChange: (newValue: boolean) => void;
    isChecked: boolean;
    
}

const CheckboxComponent = (props: ICheckboxComponentProps) => {
    const { onValueChange, isChecked } = props;
    
    const [value, setValue] = useState<boolean>(isChecked);   

    useEffect(() => {
        onValueChange(value)
    }, [value])

    const handleInputChange = (ev?: FormEvent<HTMLElement | HTMLInputElement> | undefined, newValue?: boolean) => {
        if (newValue === undefined) return;

        setValue(newValue);
    }

    return (
        <>
            <Checkbox
                label=""
                checked={value}
                onChange={handleInputChange}
                
            />
        </>
    )
}

export default CheckboxComponent