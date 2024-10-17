import { FALLBACK_CURRENCIES } from '../config/constants.js';

export const checkCurrenciesInitialized = (req, res, next) => {
    if (!global.SUPPORTED_CURRENCIES) {
        global.SUPPORTED_CURRENCIES = FALLBACK_CURRENCIES;
        console.warn('SUPPORTED_CURRENCIES not initialized. Using fallback currencies.');
    }
    next();
};