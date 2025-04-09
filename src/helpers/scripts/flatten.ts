export const flatten:any = (obj:any, concatenator = '.') =>
    Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] !== 'object' || Array.isArray(obj[key])) {
            return {
                ...acc,
                [key]: obj[key],
            };
        }

        const flattenedChild = flatten(obj[key], concatenator);

        return {
            ...acc,
            ...Object.keys(flattenedChild).reduce(
                (childAcc, childKey) => ({
                    ...childAcc,
                    [`${key}${concatenator}${childKey}`]: flattenedChild[childKey],
                }),
                {},
            ),
        };
    }, {});