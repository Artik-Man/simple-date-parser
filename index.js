const TRANSLATE = new Map([
    ['jan', new Set(['dejaneirode', 'january', 'ocak', 'enero', 'janvier', 'января', 'январь', 'янв', 'ene', 'jan', 'sty'])],
    ['feb', new Set(['defevereirode', 'february', 'şubat', 'febrero', 'février', 'февраля', 'февраль', 'фев', 'feb', 'fév', 'lut'])],
    ['mar', new Set(['demarçode', 'march', 'mart', 'marzo', 'mars', 'марта', 'март', 'мар', 'mar'])],
    ['apr', new Set(['deabrilde', 'april', 'nisan', 'abril', 'avril', 'апреля', 'апрель', 'апр', 'abr', 'avr', 'kwi'])],
    ['may', new Set(['demaiode', 'may', 'mayıs', 'mayo', 'mai', 'мая', 'май', 'maja'])],
    ['jun', new Set(['dejunhode', 'june', 'haziran', 'junio', 'juin', 'июня', 'июнь', 'июн', 'jun', 'cze'])],
    ['jul', new Set(['dejulhode', 'july', 'temmuz', 'julio', 'juillet', 'июля', 'июль', 'июл', 'jul', 'juil', 'lip'])],
    ['aug', new Set(['deagostode', 'august', 'ağustos', 'agosto', 'août', 'августа', 'август', 'авг', 'ago', 'aoû', 'sie'])],
    ['sep', new Set(['desetembrode', 'september', 'eylül', 'septiembre', 'septembre', 'сентября', 'сентябрь', 'сен', 'sep', 'wrz'])],
    ['oct', new Set(['deoutubrode', 'october', 'ekim', 'octubre', 'octobre', 'октября', 'октябрь', 'окт', 'oct', 'paź'])],
    ['nov', new Set(['denovembrode', 'november', 'kasım', 'noviembre', 'novembre', 'ноября', 'ноябрь', 'ноя', 'nov', 'lis'])],
    ['dec', new Set(['dedezembrode', 'december', 'aralık', 'diciembre', 'décembre', 'декабря', 'декабрь', 'дек', 'dic', 'déc', 'gru'])],
    ['yesterday', new Set(['yesterday', 'вчера', 'wczoraj', 'hier'])],
    ['today', new Set(['today', 'сегодня', 'aujourd\'hui'])],
    ['at', new Set(['at', 'в'])],
    ['pm', new Set(['pm'])],
    ['tomorrow', new Set(['tomorrow', 'завтра'])],
]);
const translate = (str) => {
    const reg = /([a-zа-яёçŞğéüûıź]+)/gi;
    return str.toLowerCase().replace(reg, word => {
        for (const [key, set] of TRANSLATE) {
            if (set.has(word)) {
                return key;
            }
        }
        return ' ';
    }).replace(/\s{2,}/, ' ');
};
const months = ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const logger = (log, input, date, parser) => {
    if (log === true) {
        console.group('[simple-date-parser]:logger');
        console.log('Parser: ' + parser);
        console.log(input);
        console.dir(date);
        console.groupEnd();
    }
    else if (typeof log === 'function') {
        log(input, date, parser);
    }
};
const numberFormat = (num, count = 2) => {
    return ('0' + num).slice(-count);
};
const createDate = (Y, M, D, h, m, s, a) => {
    let year = parseInt(Y + '', 10);
    if (year < 25) {
        year = 2000 + year;
    }
    else if (year < 100) {
        year = 1900 + year;
    }
    else if (year < 1000) {
        year = 1000 + year;
    }
    const month = parseInt(M + '', 10) || 1;
    if (month > 12) {
        return new Date('error');
    }
    const day = parseInt(D + '', 10) || 1;
    if (day > 31) {
        return new Date('error');
    }
    let hours = 0, minutes = 0, seconds = 0;
    if (h) {
        hours = parseInt(h + '', 10) || 0;
        if ((a === null || a === void 0 ? void 0 : a.trim()) === 'pm') {
            hours += 12;
        }
    }
    if (m) {
        minutes = parseInt(m + '', 10) || 0;
    }
    if (s) {
        seconds = parseInt(s + '', 10) || 0;
    }
    const iso = `${year}-${numberFormat(month)}-${numberFormat(day)}T${numberFormat(hours)}:${numberFormat(minutes)}:${numberFormat(seconds)}.000Z`;
    return new Date(iso);
};
export const isValidDate = (date) => date instanceof Date && !isNaN(+date);
export const parseDate = (str, log = false) => {
    str = translate(str);
    {
        const reg = /((19|20)(\d{2}))(\d{2})(\d{2})/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, Y, , , M, d] = match;
                const date = createDate(Y, M, d);
                if (isValidDate(date)) {
                    logger(log, str, date, 'YYYYMMdd');
                    return date;
                }
            }
        }
    }
    {
        const reg = /(\d{1,2})[.\-\/ \\]([a-z]{3}),?[.\-\/ \\](\d{2,4}),?\s?(at|-)?\s?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?(\s(am|pm))?/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, d, M, y, , h, m, s, a] = match;
                const date = createDate(y, months.indexOf(M), d, h, m, s, a);
                if (isValidDate(date)) {
                    logger(log, str, date, 'dd MMM YYYY at h:mm');
                    return date;
                }
            }
        }
    }
    {
        const reg = /([a-z]{3})[.\-\/ \\](\d{1,2}),?[.\-\/ \\](\d{4}),?(\s\D+)?\s?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?\s?(am|pm)?/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, M, d, y, , h, m, s, a] = match;
                const date = createDate(y, months.indexOf(M), d, h, m, s, a);
                if (isValidDate(date)) {
                    logger(log, str, date, 'MMM dd, YYYY, hh:mm:ss');
                    return date;
                }
            }
        }
    }
    {
        const reg = /(yesterday|today|tomorrow)(,)?\s?(at\s)?((\d{1,2}):(\d{1,2}):?(\d{1,2})?(\s(am|pm))?)?/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const d = new Date();
                const [, kw, , , , h, m, s, a] = match;
                if (kw === 'yesterday') {
                    d.setDate(d.getDate() - 1);
                }
                if (kw === 'tomorrow') {
                    d.setDate(d.getDate() + 1);
                }
                let Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
                const date = createDate(Y, M, D, h, m, s, a);
                if (isValidDate(date)) {
                    logger(log, str, date, 'yesterday at h:mm:ss a');
                    return date;
                }
            }
        }
    }
    {
        const reg = /(\d{4})([.\-\/ \\](\d{1,2}))([.\-\/ \\](\d{1,2}))? ?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?(\s(am|pm))?/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, Y, , M, , d, h, m, s, , a] = match;
                const date = createDate(Y, M, d, h, m, s, a);
                if (isValidDate(date)) {
                    logger(log, str, date, 'YYYY-MM-dd hh:mm:ss');
                    return date;
                }
            }
        }
    }
    {
        const reg = /(\d{1,2})([.\-\/ \\](\d{1,2}))?([.\-\/ \\](\d{1,4}))?(,| at)? ?(\d{1,2})?([.:\-\/ \\](\d{1,2}))?([.:\-\/ \\](\d{1,2}))?(\s(am|pm))?/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, D, , M, , Y, , h, , m, , s, a] = match;
                const current = new Date();
                const date = createDate(Y || current.getFullYear(), M || current.getMonth() + 1, D || current.getDate(), h, m, s, a);
                if (isValidDate(date)) {
                    logger(log, str, date, 'dd.MM.YYYY, hh:mm:ss');
                    return date;
                }
            }
        }
    }
    {
        const reg = /(\d{4})/;
        if (reg.test(str)) {
            const match = str.match(reg);
            if (match) {
                const [, Y] = match;
                const date = createDate(Y);
                if (isValidDate(date)) {
                    logger(log, str, date, 'YYYY');
                    return date;
                }
            }
        }
    }
    throw new Error(`[Date parsing error] : ${str}`);
};
