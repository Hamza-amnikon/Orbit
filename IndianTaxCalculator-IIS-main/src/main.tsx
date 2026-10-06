import React from 'react';
import {createRoot} from 'react-dom/client';
import Calculator from './calculator';
import Admin from './admin';
import Shell from './shell';
import './style.css';
createRoot(document.getElementById('root')!).render(<Shell>{window.location.pathname==='/admin'?<Admin/>:<Calculator/>}</Shell>);
