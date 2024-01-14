import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { EmpleadoCard } from './componentes/EmpleadoCard.jsx'
import { CardInfo } from './componentes/CardInfo.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
    <CardInfo/>
  </React.StrictMode>,
)
