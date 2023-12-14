import React, { useState, useEffect, useMemo } from 'react'
import { Slider, ITheme, createTheme, getTheme } from '@fluentui/react';

interface IInputComponentProps {
    onValueChange: (newValue: number, range: number[]) => void;
    maxValue: number | undefined;
    minValue: number | undefined;
    sliderValue: number | undefined;
    lowerSliderValue: number | undefined;
    formatValue: string | undefined;
    isRanged: boolean | undefined;
    originFromZero: boolean | undefined;
    stepValue: number | undefined;
    color: string;
}

const InputComponent = (props: IInputComponentProps) => {
    const { onValueChange, maxValue, minValue, sliderValue, lowerSliderValue, formatValue, isRanged, originFromZero, stepValue, color } = props;

    const componentTheme = useMemo<ITheme>(() => {
        const customTheme: ITheme = createTheme(getTheme());
        customTheme.palette.themeDark = color; //= hover
        customTheme.palette.themePrimary = color; //= hover contour
        customTheme.palette.neutralPrimary = color; // icon color
        return customTheme;
    }, [color]);

    const sliderValueFormat = (value: number) => {
        return value + (formatValue || "");
    }

    const [value, setValue] = useState<number>(sliderValue || 0);
    const [lowerValue, setLowerValue] = useState<number>(lowerSliderValue || 0);

    const handleInputChange = (newValue?: number, range?: number[]) => {
        if (newValue === undefined) {
            return;
        }

        if (range) {
            setLowerValue(range[0]);
            setValue(range[1]);
        } else {
            setValue(newValue);
        }
    }

    useEffect(() => {
        onValueChange(value, [lowerValue, value])
    }, [value, lowerValue])


    return (
        <>
            <Slider
                label=""
                max={maxValue}
                min={minValue}
                value={value}
                valueFormat={sliderValueFormat}
                lowerValue={lowerValue}
                showValue
                onChange={handleInputChange}
                ranged={isRanged}
                originFromZero={originFromZero}
                step={stepValue}
                theme={componentTheme}
            />
        </>
    )
}

export default InputComponent