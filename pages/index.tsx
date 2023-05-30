import React, {useState, useEffect} from 'react'
import {GoogleSpreadsheet} from 'google-spreadsheet'
import { JetBrains_Mono } from 'next/font/google'
import Typewriter from 'typewriter-effect';
import * as JsSearch from 'js-search';

const jbm = JetBrains_Mono({ subsets: ['latin'] })

export default function Home() {
  // Set type to GoogleSpreadsheetRow[]
  const [entries, setEntries] : any  = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchStr, setSearchStr] = useState('')

  useEffect(() => {
    const strings = entries.map((entry: any) => ({'Entry': entry.Entry}));
    // Create a new search object
    const search: any = new JsSearch.Search('isbn')
    // Add the strings to the search object
    search.addIndex('Entry')
    search.addDocuments(strings)
    // Set the search object
    setSearch(search);
  }, [entries])

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

  console.log(search, search.search('worry'))
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
      <div className="flex justify-between pb-8">
        <input className="w-full md:w-1/2 p-2 ml-4 rounded-md border-2 border-gray-200 focus:outline-none focus:border-gray-300"
        placeholder="Search"
        onChange={(e) => {
          setSearchStr(e.target.value)
        }
        }/>
      </div>
      <div className="flex flex-col justify-between pb-8">
        {entries.filter((entry: any) => {
          if (searchStr === '' || !search) return true
          const searchResult = search.search(searchStr)
          // If search result is empty, return false
          // If search result is not a list, return false
          if (!searchResult || !Array.isArray(searchResult) || searchResult.length === 0) {
            return false
          } else {
            return searchResult.map((result: any) => result.Entry).includes(entry.Entry)
          }
        }).map((entry: any) => (
          <EntryDisplay entry={entry} key={entry.Time}/>
        ))}
      </div>
    </main>
  )
}

const EntryDisplay = ({entry}: any) => {
  // Create space between time and entry
  return (
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
  )
}