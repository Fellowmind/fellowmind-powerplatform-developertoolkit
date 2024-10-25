import React, { useState, useEffect, useMemo } from 'react'
import { Rating, RatingSize, ITheme, createTheme, getTheme } from '@fluentui/react';

interface IInputComponentProps {
    onValueChange: (newValue: number) => void;
    ratingvalue: number;
    maxvalue: number;
    color: string;
    isReadOnly: boolean;
    isDisabled: boolean;
}

const RatingComponent = (props: IInputComponentProps) => {
    const { onValueChange, ratingvalue, maxvalue, color, isReadOnly, isDisabled } = props;

    const [value, setValue] = useState(ratingvalue);

    useEffect(() => {
        if (value !== ratingvalue) {
            console.log("useEffect props.rating changed : " + ratingvalue);
            setValue(ratingvalue);
        }
    }, [ratingvalue]); //Props are changed

    const componentTheme = useMemo<ITheme>(() => {
        const customTheme: ITheme = createTheme(getTheme());
        customTheme.palette.themeDark = color; //= hover
        customTheme.palette.themePrimary = color; //= hover contour
        customTheme.palette.neutralPrimary = color; // icon color

        return customTheme;
    }, [color]);

    const handleRatingChange = (event: React.FormEvent<HTMLElement | HTMLTextAreaElement>, newValue?: number | undefined) => {
        if (newValue === undefined) return;
        setValue(newValue);
        onValueChange(Number(newValue))
        console.log("Rating changed: " + newValue);

    }

    return (
        <>
            <Rating
                max={maxvalue}
                size={RatingSize.Large}
                rating={value}
                defaultRating={0}
                allowZeroStars
                ariaLabel="Star rating of the content"
                ariaLabelFormat={`Select {0} of ${maxvalue} stars`}
                onChange={(ev, rating) => handleRatingChange(ev, rating)}
                theme={componentTheme}
                readOnly={isReadOnly}
                disabled={isDisabled}
            />
        </>
    )
}

export default RatingComponent