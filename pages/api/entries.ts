// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
    const SERVICE_EMAIL = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY;

    // If the env vars are not set, return an error
    if (!SHEET_ID || !SERVICE_EMAIL || !PRIVATE_KEY) {
        return res.status(500).json({ error: 'Environment variables not set!' });
    } else {
        const doc = new GoogleSpreadsheet(SHEET_ID);
        doc.useServiceAccountAuth({
            client_email: SERVICE_EMAIL,
            private_key: PRIVATE_KEY,
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        const data = rows.map((row) => {
            return {
                id: row.UID,
                entry: row.Entry,
                time: row.Time,
            }
        });
        return res.status(200).json({ data });
    }
}
