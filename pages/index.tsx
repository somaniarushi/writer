import Image from 'next/image'
import React, {useState, useEffect} from 'react'
import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet'
import { JetBrains_Mono } from 'next/font/google'
import Typewriter from 'typewriter-effect';
import { time } from 'console';


const jbm = JetBrains_Mono({ subsets: ['latin'] })

export default function Home() {
  // Set type to GoogleSpreadsheetRow[]
  const [entries, setEntries] : any  = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID
    const doc = new GoogleSpreadsheet(SHEET_ID)
    // If env variables are not set, do not load
    if (!SHEET_ID || !process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY) {
      setError(true)
      return
    }
    doc.useServiceAccountAuth({
      client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY.replace(
        /\\n/gm,
        '\n'
      ),
    })
    doc.loadInfo().then(() => {
      const sheet = doc.sheetsByIndex[0]
      sheet.getRows().then((rows) => {
        setEntries(rows.reverse())
        setLoading(false)
      })
    }).catch((e) => {
      console.log(e)
      setError(true)
    })
  }
  , [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className={`text-4xl ${jbm.className}`}>Error loading entries</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className={`text-4xl ${jbm.className}`}>Loading...</p>
      </div>
    )
  }

  return (
    <main className={`flex flex-col pt-8 pr-5 md:p-16 ${jbm.className}`}>
      <div className="flex justify-between pb-8">
        <h1 className="text-4xl pl-5 font-bold">
        <Typewriter
          onInit={(typewriter) => {
            typewriter.typeString('The Writer')
              .callFunction(() => {
                console.log('String typed out!');
              })
              .start();
          }}
        />
        </h1>
      </div>
      {/* Align all entries with each other */}
      <div className="flex flex-col justify-between pb-8">
        {entries.map((entry: any) => (
          // Create space between time and entry
          <div className="flex flex-col md:flex-row md:items-center pb-8"
          key={entry.Time}>
            {/* Make font smaller */}
            <p className="text-sm pr-8 pl-5 text-gray-400 text-2sm">
            {
              // Display date and time in a readable format, use zero padding
              // All dates should be the same length
              new Date(entry.Time).toLocaleString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            }</p>
            <p className="pl-5 md:pl-0 md:text-sm md:w-1/2"
            >{entry.Entry}</p>
          </div>
        ))}
      </div>
    </main>
  )
}