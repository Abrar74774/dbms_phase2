"use client"
import { useState, useEffect } from 'react';
import SqlQueryInterface from '../../components/SqlQueryInterface'

export default function Home() {
  const [output, setOutput] = useState();
  const getData = () => {
    fetch('/api')
    .then(res => res.json())
    .then(out => console.log(out));
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <div>
      <h1 style={style}>Cost Estimator</h1>
      <SqlQueryInterface />
    </div>
  );
};

const style = {
  textAlign: 'center'
}

// export default Home