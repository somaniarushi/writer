import { useRouter } from "next/router";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useEffect, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import Head from 'next/head';

const jbm = JetBrains_Mono({ subsets: ["latin"] });

export default function DynamicPage() {
    const router = useRouter();
    const { slug } = router.query; // Access the dynamic parameter value

    const [entries, setEntries]: any = useState([]);
    const [entry, setEntry]: any = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
    const doc = new GoogleSpreadsheet(SHEET_ID);
    // If env variables are not set, do not load
    if (
        !SHEET_ID ||
        !process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        !process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
    ) {
        setError(true);
        return;
    }
    doc.useServiceAccountAuth({
        client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY.replace(
        /\\n/gm,
        "\n"
        ),
    });
    doc
        .loadInfo()
        .then(() => {
        const sheet = doc.sheetsByIndex[0];
        sheet.getRows().then((rows) => {
            setEntries(rows.reverse());
            setLoading(false);
        });
        })
        .catch((e) => {
        console.log(e);
        setError(true);
        });
    }, []);

    // If the slug matches any entry's UID, set the entry
    useEffect(() => {
        if (entries.length > 0) {
            const entry = entries.find((entry: any) => entry.UID === slug);
            setEntry(entry);
        }
    }, [entries, slug]);

    if (loading) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className}`}>Loading...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className}`}>Error loading entries</p>
        </div>
        );
    }

    if (!entry) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className} pb-4`}>Entry not found</p>
            <Link href="/" className={`${jbm.className} text-blue-500`}>Back to Home</Link>
        </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 md:p-64">
        <Head>
            <title>{entry.Entry}</title>
            <meta name="description" content={entry.Entry} />
        </Head>
        <p className={`text-sm ${jbm.className} text-gray-400 pb-2`}>{
            // Display date and time in a readable format, use zero padding
            // All dates should be the same length
            new Date(entry.Time).toLocaleString("en-US", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          }</p>
        <p className={`${jbm.className} pb-2`}>{entry.Entry}</p>
        <Link href="/" className={`${jbm.className} text-blue-500`}>Back to Home</Link>
        </div>
    );
}
