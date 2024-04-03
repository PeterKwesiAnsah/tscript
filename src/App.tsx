import React from 'react';
import { createMonacoEditor } from './monaco/setupenv';

//import * as monaco from 'monaco-editor';
//import './App.css';

function App() {
	React.useEffect(createMonacoEditor, []);
	return <></>;
}

export default App;
