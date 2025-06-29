import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [html, setHtml] = useState('<div class="b">Hello</div>');
  const [css, setCss] = useState('body { background: lightblue; }\n.b { background-color: black; }');
  const [js, setJs] = useState("console.log('Hello from JS');");
  const [srcDoc, setSrcDoc] = useState('');
  const [jsToRun, setJsToRun] = useState('');
  const [logs, setLogs] = useState([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const combinedCode = `
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              const log = console.log;
              console.log = (...args) => {
                window.parent.postMessage({ source: 'console', payload: args }, '*');
                log(...args);
              };
              try {
                ${jsToRun}
              } catch (e) {
                console.log('Error:', e.message);
              }
            </script>
          </body>
        </html>
      `;
      setSrcDoc(combinedCode);
    }, 250);
    return () => clearTimeout(timeout);
  }, [html, css, jsToRun]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source === 'console') {
        setLogs((prev) => [...prev, ...event.data.payload]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-screen p-4 bg-gray-100">
      <div className="flex flex-col space-y-4 overflow-auto">
        <div>
          <h2 className="font-bold text-lg">HTML:</h2>
          <Editor height="100px" language="html" value={html} onChange={(v) => setHtml(v)} theme="vs-dark" />
        </div>
        <div>
          <h2 className="font-bold text-lg">CSS:</h2>
          <Editor height="100px" language="css" value={css} onChange={(v) => setCss(v)} theme="vs-dark" />
        </div>
        <div>
          <h2 className="font-bold text-lg">JavaScript:</h2>
          <Editor height="100px" language="javascript" value={js} onChange={(v) => setJs(v)} theme="vs-dark" />
          <button
            onClick={() => {
              setLogs([]);
              setJsToRun(js);
            }}
            className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Run JS
          </button>
        </div>
        <div className="bg-black text-green-400 p-2 rounded h-32 overflow-auto">
          <h2 className="text-green-300">Console:</h2>
          {logs.map((log, index) => (
            <div key={index}>{JSON.stringify(log)}</div>
          ))}
        </div>
      </div>
      <div className="border rounded bg-white h-full">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title="Preview"
          sandbox="allow-scripts"
          frameBorder="0"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default App;
