import { currency } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';

interface CurrencyPattern {
    code: string;
    patterns: RegExp[];
    symbol: string;
}

interface BankFormat {
    name: string;
    emailDomain: string;
    subjectPatterns: string[];
    amountPatterns: RegExp[];
    currency: string;
    extractDetails: (html: string) => Record<string, string>;
}

const currencyPatterns: CurrencyPattern[] = [
    {
        code: 'NGN',
        patterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /₦\s*([\d,]+\.?\d*)/i,
            /Amount[:\s]+NGN\s*([\d,]+\.?\d*)/i
        ],
        symbol: '₦'
    },
    {
        code: 'USD',
        patterns: [
            /USD\s*([\d,]+\.?\d*)/i,
            /\$\s*([\d,]+\.?\d*)/i,
            /Amount[:\s]+USD\s*([\d,]+\.?\d*)/i
        ],
        symbol: '$'
    },
    {
        code: 'EUR',
        patterns: [
            /EUR\s*([\d,]+\.?\d*)/i,
            /€\s*([\d,]+\.?\d*)/i,
            /Amount[:\s]+EUR\s*([\d,]+\.?\d*)/i
        ],
        symbol: '€'
    },
    {
        code: 'GBP',
        patterns: [
            /GBP\s*([\d,]+\.?\d*)/i,
            /£\s*([\d,]+\.?\d*)/i,
            /Amount[:\s]+GBP\s*([\d,]+\.?\d*)/i
        ],
        symbol: '£'
    }
];

const bankFormats: BankFormat[] = [
    {
        name: 'ProvidusBank',
        emailDomain: 'alert@providusbank.com',
        subjectPatterns: ['Debit Alert', 'Transaction Alert'],
        currency: 'NGN',
        amountPatterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /Amount[:\s]+NGN\s*([\d,]+\.?\d*)/i
        ],
        extractDetails: (html: string) => {
            const details: Record<string, string> = {};
            const fields = [
                'Account Number',
                'Amount',
                'Narrative',
                'Time',
                'Reference',
                'Branch',
                'Available Balance',
                'Ledger Balance'
            ];

            fields.forEach(field => {
                const regex = new RegExp(`${field}[:\\s]*(.*?)(?:<|\\n|$)`, 'i');
                const match = html.match(regex);
                if (match) details[field] = match[1].trim();
            });

            return details;
        }
    },
    {
        name: 'GTBank',
        emailDomain: 'gtbank.com',
        subjectPatterns: ['Debit Transaction', 'Transaction Notification'],
        currency: 'NGN',
        amountPatterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /Amount:\s*NGN([\d,]+\.?\d*)/i,
            /\bNGN\s*([\d,]+\.?\d*)\b/i
        ],
        extractDetails: (html: string) => {
            const details: Record<string, string> = {};
            const fields = [
                'Account Number',
                'Amount',
                'Transaction Location',
                'Value Date',
                'Trans Date',
                'Reference Number',
                'Available Balance'
            ];

            // GTBank often uses table format
            fields.forEach(field => {
                const patterns = [
                    new RegExp(`${field}[:\\s]*(.*?)(?:<|\\n|$)`, 'i'),
                    new RegExp(`<td[^>]*>${field}:?</td>\\s*<td[^>]*>([^<]+)</td>`, 'i')
                ];

                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match) {
                        details[field] = match[1].trim();
                        break;
                    }
                }
            });

            return details;
        }
    },
    {
        name: 'AccessBank',
        emailDomain: 'accessbank.com',
        subjectPatterns: ['Debit Alert', 'Transaction Notice'],
        currency: 'NGN',
        amountPatterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /Amount:\s*NGN([\d,]+\.?\d*)/i,
            /Debit Amount:\s*NGN([\d,]+\.?\d*)/i
        ],
        extractDetails: (html: string) => {
            const details: Record<string, string> = {};
            const fields = [
                'Account Number',
                'Account Name',
                'Description',
                'Amount',
                'Value Date',
                'Time',
                'Balance'
            ];

            // Access Bank often uses div-based layout
            fields.forEach(field => {
                const patterns = [
                    new RegExp(`${field}[:\\s]*(.*?)(?:<|\\n|$)`, 'i'),
                    new RegExp(`<div[^>]*>${field}:?</div>\\s*<div[^>]*>([^<]+)</div>`, 'i')
                ];

                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match) {
                        details[field] = match[1].trim();
                        break;
                    }
                }
            });

            return details;
        }
    },
    {
        name: 'FirstBank',
        emailDomain: 'firstbank.com',
        subjectPatterns: ['Debit Transaction Alert', 'Transaction Notification'],
        currency: 'NGN',
        amountPatterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /Amount:\s*NGN([\d,]+\.?\d*)/i,
            /Debit Amount:\s*NGN([\d,]+\.?\d*)/i
        ],
        extractDetails: (html: string) => {
            const details: Record<string, string> = {};
            const fields = [
                'Account Number',
                'Transaction Amount',
                'Description',
                'Value Date',
                'Time of Transaction',
                'Available Balance'
            ];

            fields.forEach(field => {
                const patterns = [
                    new RegExp(`${field}[:\\s]*(.*?)(?:<|\\n|$)`, 'i'),
                    new RegExp(`<td[^>]*>${field}:?</td>\\s*<td[^>]*>([^<]+)</td>`, 'i')
                ];

                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match) {
                        details[field] = match[1].trim();
                        break;
                    }
                }
            });

            return details;
        }
    },
    {
        name: 'UBA',
        emailDomain: 'ubagroup.com',
        subjectPatterns: ['UBA Debit Alert', 'Debit Notification'],
        currency: 'NGN',
        amountPatterns: [
            /NGN\s*([\d,]+\.?\d*)/i,
            /Amount:\s*NGN([\d,]+\.?\d*)/i,
            /Transaction Amount:\s*NGN([\d,]+\.?\d*)/i
        ],
        extractDetails: (html: string) => {
            const details: Record<string, string> = {};
            const fields = [
                'Account Number',
                'Transaction Amount',
                'Transaction Details',
                'Date',
                'Time',
                'Available Balance'
            ];

            fields.forEach(field => {
                const patterns = [
                    new RegExp(`${field}[:\\s]*(.*?)(?:<|\\n|$)`, 'i'),
                    new RegExp(`<td[^>]*>${field}:?</td>\\s*<td[^>]*>([^<]+)</td>`, 'i')
                ];

                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match) {
                        details[field] = match[1].trim();
                        break;
                    }
                }
            });

            return details;
        }
    }
];

async function getCurrencyId(db: any, currencyCode: string) {
    const result = await db
        .select()
        .from(currency)
        .where(eq(currency.code, currencyCode))
        .limit(1);
    
    if (!result.length) {
        console.log(`Currency not found: ${currencyCode}`);
        return null;
    }
    
    return result[0].id;
}


function detectCurrency(text: string): { code: string; amount: number } | null {
    for (const currency of currencyPatterns) {
        for (const pattern of currency.patterns) {
            const match = text.match(pattern);
            if (match) {
                const numericMatch = match[0].match(/[\d,]+\.?\d*/);
                if (numericMatch) {
                    return {
                        code: currency.code,
                        amount: parseFloat(numericMatch[0].replace(/,/g, ''))
                    };
                }
            }
        }
    }
    return null;
}

export function getBankFormat(from: string, subject: string): BankFormat | null {
    return bankFormats.find(bank => 
        from.includes(bank.emailDomain) ||
        bank.subjectPatterns.some(pattern => 
            subject.toLowerCase().includes(pattern.toLowerCase())
        )
    ) || null;
}

export async function parseEmailContent(html: string, bankFormat: BankFormat) {
    const details = bankFormat.extractDetails(html);
    let amount: number | null = null;

    // Try to extract amount using bank-specific patterns
    for (const pattern of bankFormat.amountPatterns) {
        const match = html.match(pattern);
        if (match) {
            amount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    const detected = detectCurrency(html);
    if (!detected) {
        return null;
    }

    const currencyId = await getCurrencyId(db,detected.code);
    if (!currencyId) {
        return null;
    }

    return {
        details,
        amount,
        bankName: bankFormat.name,
        currencyId,
        currencyCode: detected.code
    };
}
