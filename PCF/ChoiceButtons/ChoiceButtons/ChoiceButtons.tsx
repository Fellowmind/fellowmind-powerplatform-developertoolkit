import React from 'react'
import { Stack } from "@fluentui/react"
import ButtonComponent from './ButtonComponent';

interface IChoiceButtonssProps {
    optionset: IOptionSetOption[],
    onOptionsetChange: (value: number | null) => void;
    currentValue: number | null,
    primaryButtonBackground: string;
    secondaryButtonBackground: string;
    isDisabled: boolean;
}

export interface IOptionSetOption {
  Label: string;
  Value: number;
  Color: string;
}

const ChoiceButtonss = (props: IChoiceButtonssProps) => {
  const { optionset, onOptionsetChange , currentValue, primaryButtonBackground, secondaryButtonBackground, isDisabled} = props;
  
  return (
    <Stack horizontal horizontalAlign='start' wrap>
      {optionset.map((option) => (
        <Stack.Item key={option.Value}>
              <ButtonComponent
                optionsetValue={option}
                selectedValue={currentValue}
                handleValueChange={onOptionsetChange}
                primaryButtonBackground={primaryButtonBackground}
                secondaryButtonBackground={secondaryButtonBackground}
                isDisabled={isDisabled}
              />
        </Stack.Item>
      ))}
    </Stack>
  )
}

export default ChoiceButtonss