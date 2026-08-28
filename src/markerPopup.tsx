import React, {useLayoutEffect, useRef, useState} from "react";
import { type eventPopupType, type StoryElement } from "./types"
import './App.css'

export function MarkerPopup({d, globeLoaded, onClose} : {d:eventPopupType | null,globeLoaded:boolean, onClose:()=>void})
{
  const containerRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [hasScroll , setHasScroll] = useState<boolean>(false);
  const [isTopNextOutOfView, setIsTopNextOutOfView] = useState<boolean>(false);
  useLayoutEffect(()=>{
  
    const element = containerRef.current;
    if (element){
  
    const handleScroll = () => {
      setHasScroll(false);
      element.removeEventListener('scroll', handleScroll);
    }

    const checkScrollable = () => {
      // If scrollHeight is greater than clientHeight, a vertical scrollbar exists
      const isScrollable = element.scrollHeight > element.clientHeight;
      setHasScroll(isScrollable);
      if(isScrollable)
      {
         element.addEventListener('scroll', handleScroll);
      }
    };
   

    // Check on mount
    checkScrollable();

   
  }

    const nextButton = nextButtonRef.current;
    let observer : IntersectionObserver | null = null;
    if(nextButton)
    {
      observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        setIsTopNextOutOfView(!entry.isIntersecting);
      },{ threshold: 0 } );
      observer.observe(nextButton);
    }
    return (()=>{
      if(nextButton)
      observer?.unobserve(nextButton);
    })
  },[d,globeLoaded]);



  if(!d || !d?.d || !globeLoaded){
    return <div></div>;
  }
    return (
        <div ref={containerRef} className="markerPopupContainer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '10%' }}>
            <strong className="popupHeading">{d.d.label}</strong>
            <button 
              ref={nextButtonRef}
              onClick={() => onClose()} 
              className="popupCloseButton"
            >
              Next
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
          {isTopNextOutOfView && (<div style={{ display: 'flex', justifyContent: 'flex-end', height: '10%' }}>
            <button 
              onClick={() => onClose()} 
              className="popupCloseButton"
            >
              Next
            </button>
          </div>)}
          {hasScroll && (
            <div className="scrollIndicator">
              Scroll to read more
            </div>
          )}
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
