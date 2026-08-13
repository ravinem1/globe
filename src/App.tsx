import { useEffect, useState } from 'react';
import PersonTimelineGlobe from './PersonTimeLineGlobe';

function App() {
  const [entity, setEntity] = useState<string | null>(null);
  useEffect(() => {
    
  },[]);

  const philospherChanged = (e : React.ChangeEvent<HTMLSelectElement,HTMLSelectElement>) =>
  {
    if(e.target.selectedOptions[0].id !== '0')
    {
      setEntity(e.target.selectedOptions[0].value);
    }
    else{
      setEntity(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ height: '5vh', display: 'flex', alignItems: 'center', justifyContent:"flex-start",
         padding: '5px 10px', gap: '5px' }}>
        {/* <select id="entityList" >
          <option id="0">--Select--</option>
          <option id="1">Philosphers</option>
        </select>  */}    
        <select id="philospherList" onChange={philospherChanged}>
          <option id="0">--Select--</option>
          <option id="1">Socrates</option>
          <option id="2">Aristotle</option>
        </select>     
      </div>
      
      {entity && (<PersonTimelineGlobe philospherName={entity}/> )}      
      
    </div>
  )
}

export default App
