"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react'

export default function Home() {
  const [output, setOutput] = useState();
  const getData = () => {
    fetch('/api')
    .then(res => res.json())
    .then(out => setOutput(out || "nothing"));
  }
  useEffect(() => {
    getData()
  }, [])
  return (
    <main className={styles.main}>
      <div>
        <label htmlFor="sqlInput">SQL command: </label>
        <input id='sqlInput' className='input' type="text" placeholder="Enter SQL statement here" />
      </div>
      <div>
        {!output ? <p>Output will be displayed here...</p>
        :
        <div>
          <p>{output.fields.map(field => <span className={styles.field}>{field.name}</span> )}</p> 
          <p>{output.rows.map(row => <span>{row}</span>)}</p>
        </div>}
       
      </div>
    </main>
  )
}
