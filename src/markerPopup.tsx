import React from "react";
import { type eventPopupType, type StoryElement } from "./types"

export function MarkerPopup({d, onClose} : {d:eventPopupType, onClose:()=>void})
{
  if(!d?.d){
    return <div></div>;
  }
    return (
        <div
          style={{
            position: 'fixed',
            left: `${d.x + 15}px`, 
            top: `${d.y - 115}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#333',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 999,
            pointerEvents: 'auto',
            maxWidth: '400px',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '16px' }}>{d.d.label}</strong>
            <button 
              onClick={() => onClose()} 
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
            >
              ×
            </button>
          </div>
          {d.d.story && (<PrepareCardHtml story={d.d.story}/>)}
        </div>
    )
}

function PrepareCardHtml({story} : {story : StoryElement[]}) 
{
  return React.createElement(
    'div',
    {style: {display : 'flex', flexDirection: 'column', gap: '6px', padding: '10px'}},
    story.map((child, i) => {
    if(child.type == "heading")
    {
      return React.createElement('strong', {key : i, style: {fontSize:'14px'}}, child.value);
    }
    else if (child.type === 'image') {
      return React.createElement('img', { key: i, src: child.value, height: '100px', width: '100px' });
    }
    else if(child.type === 'paragraph')
    {
      return React.createElement('p', { key: i, style : {fontSize: '12px'} }, child.value);
    }
  }));
}
