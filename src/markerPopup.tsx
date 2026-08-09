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
           position: 'absolute',
           top: '5vh',
           right: 0,
           width: '25%',
           height: '95%',
           zIndex: 10,
           boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
           boxSizing: 'border-box',
           backgroundColor: 'rgba(255, 255, 255, 0.95)',
           color: '#333',
           borderRadius: '8px',
           fontFamily: 'sans-serif',
           padding: '12px',
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
    {style: {display : 'flex', flexDirection: 'column', gap: '6px', padding: '10px', height: "90%", 
      overflow: 'auto'}},
    story.map((child, i) => {
    if(child.type == "heading")
    {
      return React.createElement('strong', {key : i, style: {fontSize:'14px', flex: '0 1 auto'}}, child.value);
    }
    else if (child.type === 'image') {
      return React.createElement('div', {style:{flex: '2 0 70px', minHeight: 0, justifyContent: "center", 
          alignItems: "center", display: "flex"}}, 
        React.createElement('img', { key: i, style: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain"} ,
          src: child.value })
      );
    }
    else if(child.type === 'paragraph')
    {
      return React.createElement('p', { key: i, style : {fontSize: '12px', flex: '0 1 auto'} }, child.value);
    }
  }));
}
