import { type eventPopupType } from "./types"

export function MarkerPopup({d, onClose} : {d:eventPopupType, onClose:()=>void})
{
    return (
        <div
          style={{
            position: 'fixed',
            left: `${d.x + 15}px`, // 15px offset prevents cursor overlap
            top: `${d.y + 15}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#333',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 999,
            pointerEvents: 'auto',
            maxWidth: '200px',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '14px' }}>{d.d.label}</strong>
            <button 
              onClick={() => onClose()} 
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}
            >
              ×
            </button>
          </div>
           <p style={{ margin: '8px 0 0 0', fontSize: '12px', lineHeight: '1.4' }}>{d.d.story}</p>
        </div>
    )
}