/**
 * This function normalizes a string by replacing umlauts and converting it to lower case.
 * @param stringToReplace string to normalize
 */
export function normalizeString(stringToReplace:string) :string {
    return stringToReplace.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').toLowerCase();
}




