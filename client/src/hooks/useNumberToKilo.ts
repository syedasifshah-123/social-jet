"use client";

export const useNumberToKilo = () => {

    const format = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(num).toLowerCase();
    };

    return format;
};