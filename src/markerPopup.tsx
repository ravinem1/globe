import React from "react";
import { type eventPopupType, type StoryElement } from "./types"
import './App.css'

export function MarkerPopup({d, globeLoaded, onClose} : {d:eventPopupType | null,globeLoaded:boolean, onClose:()=>void})
{
  if(!d || !d?.d || !globeLoaded){
    return <div></div>;
  }
    return (
        <div className="markerPopupContainer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '10%' }}>
            <strong className="popupHeading">{d.d.label}</strong>
            <button 
              onClick={() => onClose()} 
              className="popupCloseButton"
            >
              ×
            </button>
          </div>
          <div className="popupStoryContainer">
            <strong className="storyHeading">{d.d.story?.storyHeading}</strong>
            <div className="storyImageParaContainer">
              {d.d.story?.storyImage && (<div className="storyImageContainer">
                <img className="storyImg" src={d.d.story?.storyImage}></img>
              </div>)}
              {d.d.story?.storyParas && (<PrepareCardHtml story={d.d.story}/>)}
            </div>
          </div>
          
        </div>
    )
}

function PrepareCardHtml({story} : {story : StoryElement}) 
{
  return React.createElement('div',{className:'storyParaContainer'},
        story.storyParas.map((para, i) => {
          return React.createElement('p', { key: 'para'+i, className : 'storyParagraph' }, para)
        }
      )      
    )
}
