import React from 'react'
import { Icon, Stack, Text } from '@fluentui/react';
import { stackItemStyles, configureStackTokens } from './ChoiceSearchAndColorStyles';
import { IOptionSetOption } from './ChoiceSearchAndColor';

interface IOptionProps {
    selectedValue: number | null;
    option: IOptionSetOption
    selectOption: (option: IOptionSetOption) => void;
    displayColors: number | boolean | null
}

const Option = (props: IOptionProps) => {
    const { selectedValue, option, selectOption, displayColors } = props;
    return (
        <Stack.Item align="center" styles={stackItemStyles} style={{ background: selectedValue === option.Value ? "rgba(0, 120, 212, 0.4)" : "#FFF" }} onMouseDown={() => selectOption(option)}>
            <Stack tokens={configureStackTokens} horizontal verticalAlign='center'>
                <Icon iconName='FullCircleMask' style={{ color: option.Color ? option.Color : "#ECECEC", display: displayColors ? "block" : "none"}}/>
                <Text style={{ color: "#909090" }}>{option.Label}</Text>
            </Stack>
        </Stack.Item>
    )
}

export default Option