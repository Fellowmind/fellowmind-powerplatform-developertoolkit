import { Stack, TextField } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';
import React, { useState, useEffect } from 'react'
import { IInputs, IOutputs } from "../generated/ManifestTypes";
import { errorIconStyles, inputStyles, stackTokens } from './IbanInput.styles';

interface IIbanInputProps {
    ibanAccountNumber: string;
    context: ComponentFramework.Context<IInputs>;
    onIbanChange: (value: string) => void;
    setIban: (valid: boolean, iban: string) => void;
}

const IbanInput = (props: IIbanInputProps) => {
    const { ibanAccountNumber, context, onIbanChange, setIban } = props;

    const [iban, setIbanHook] = useState("");
    const [ibanIsValid, setIsIbanValid] = useState(false)

    useEffect(() => {
        setIbanHook(ibanAccountNumber)
    }, [ibanAccountNumber])

    useEffect(() => {
        const ibanIsValid = isValidIBANNumber(iban) === 1 ? true : false;
        setIban(ibanIsValid, iban);
        setIsIbanValid(ibanIsValid)
    }, [iban])

    /*
     * Returns 1 if the IBAN is valid 
     * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
     * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
     */
    const isValidIBANNumber = (input: string) => {
        const CODE_LENGTHS: { [key: string]: number } = {
            FI: 18
        };

        let iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
            code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
            digits;
        // check syntax and length
        if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
            return false;
        }
        // rearrange country code and check digits, and convert chars to ints
        digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter): any {
            return letter.charCodeAt(0) - 55;
        });
        // final check
        const result = mod97(digits);

        return result;
    }

    const mod97 = (string: string) => {
        let checksum: any = string.slice(0, 2), fragment;
        for (var offset = 2; offset < string.length; offset += 7) {
            fragment = String(checksum) + string.substring(offset, offset + 7);
            checksum = parseInt(fragment, 10) % 97;
        }
        return checksum;
    }

    const handleIbanChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) => {
        setIbanHook(newValue as string);
    }

    return (
        <Stack horizontal verticalAlign='center' tokens={stackTokens}>
            <Stack.Item>
                <TextField label="" placeholder='---'  value={iban} styles={inputStyles} onChange={handleIbanChange} />
            </Stack.Item>
            <Stack.Item>
                {ibanIsValid ? "" : <Icon iconName='Error' styles={errorIconStyles} />}
            </Stack.Item>
        </Stack>
    )
}

export default IbanInput