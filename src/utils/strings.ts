export const trunc = (str: string, nb = 6): string => {
    if (str.length > 14) {
        const start = str.slice(0, nb);
        const end = str.slice(-nb);

        return `${start}...${end}`;
    }

    return str;
};
