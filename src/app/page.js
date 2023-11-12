"use client"
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
      <h1>Cost Estimator</h1>
      <SqlQueryInterface />
    </div>
  );
};

// export default Home