
export default function pluralise(value, str1, str2, lang) {
    if (typeof value !== 'number') { return; }

    value = Math.abs(value);

    // TODO: We could get lang from the closest parent with lang?
    str1 = str1 || '';
    str2 = str2 || 's';

    // In French, numbers less than 2 are considered singular, where in
    // English, Italian and elsewhere only 1 is singular.
    return lang === 'fr' ?
        (value < 2 && value >= 0) ? str1 : str2 :
        value === 1 ? str1 : str2 ;
}
