import React, { useState, useEffect, useRef } from 'react'
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack, Callout, Text, TextField, Icon } from '@fluentui/react';
import { asyncSearchBoxStyles, calloutStyles, container, stackItemStyles, stackStyles } from './ChoiceSearchAndColorStyles';
import Option from "./Option";

export interface IOptionSetOption {
  Label: string;
  Value: number;
  Color: string;
}

interface IChoiceSearchAndColorComponentProps {
  options: IOptionSetOption[];
  onValueChange: (value: number) => void;
  currentValue: number; 
  displayColors: number | boolean | null;
  isDisabled: boolean | null;
}

const ChoiceSearchAndColorComponent = (props: IChoiceSearchAndColorComponentProps) => {
  const { options, onValueChange, currentValue, displayColors, isDisabled } = props;
  const [renderedOptions, setRenderedOptions] = useState<IOptionSetOption[]>(options);
  const [selectedOption, setSelectedOption] = useState<IOptionSetOption | undefined | null>(null);
 
  const [inputValue, setInputValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const calloutTarget = useRef(null);

  useEffect(() => {
    if(inputValue.trim().length > 0) {
        const matchingOptions = options.filter(o => o.Label.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase()));
        setRenderedOptions(matchingOptions)
        openOptionList();
    }
  }, [inputValue])

  useEffect(() => {
    // set default value for when the component first renders
    if(!selectedOption && currentValue) {
      const deafultOption = options.find(o => o.Value === currentValue);
      setSelectedOption(deafultOption);
    }
  }, [options])


  const handleInputChange = (text: string) => {
    setInputValue(text)
  }

  const selectOption = (option: IOptionSetOption) => {
    setSelectedOption(option);
    onValueChange(option.Value);
    setInputValue("");
    closeOptionList();
  }

  const closeOptionList = () => {
    setShowOptions(false);
    setInputValue("");
    setRenderedOptions(options);
  }

  const openOptionList = () => {
    setShowOptions(true);
  }

  const setDefaultOptions = () => {
    setRenderedOptions(options);
    closeOptionList();
  }

  const onBlur = (e: any) => {

    closeOptionList();
  }

  return (
    <>
      <div ref={calloutTarget} style={container}> 
         <Icon iconName='FullCircleMask' style={{ color: selectedOption?.Color ? selectedOption.Color : "#ECECEC", display: displayColors && selectedOption ? "block" : "none", marginRight: "0.5rem"}}/>
        <TextField value={inputValue} onChange={(e, newValue) => handleInputChange(newValue as string)} styles={asyncSearchBoxStyles}  placeholder={selectedOption ? selectedOption.Label : ""} onBlur={onBlur} onClick={openOptionList} disabled={isDisabled || false} /*v onClear={setDefaultOptions} *//>
      </div>
      {showOptions ? (
                <Callout
                    beakWidth={0}
                    gapSpace={0}
                    target={calloutTarget.current}
                    styles={calloutStyles}
                >
                    <Stack styles={stackStyles}>
                        {renderedOptions.length > 0 ? (
                            renderedOptions.map((op: IOptionSetOption) => (
                              <Option key={op.Value} option={op} selectedValue={selectedOption?.Value || null} selectOption={selectOption} displayColors={displayColors} />
                            ))
                        ) : (
                                <Stack.Item align="center" styles={stackItemStyles}>
                                    <Text style={{ color: "#909090" }}>No found options</Text>
                                </Stack.Item>
                            )}

                    </Stack>
                </Callout>
            ) : null}
    </>
  )
}

export default ChoiceSearchAndColorComponent