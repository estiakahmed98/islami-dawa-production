import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

interface JoditEditorProps {
  placeholder?: string;
  initialValue?: string;
  onContentChange?: (content: string) => void;
}

const JoditEditorComponent: React.FC<JoditEditorProps> = ({
  placeholder = "Start typing...",
  initialValue = "",
  onContentChange,
}) => {
  const editor = useRef(null);
  const [content, setContent] = useState(initialValue);

  const config = useMemo(
    () => ({
      readonly: false, // Allows editing
      toolbar: true, // Show toolbar
      placeholder, // Set placeholder text
    }),
    [placeholder]
  );

  const handleBlur = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <div>
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={handleBlur} // Update content on blur
        onChange={() => {}} // No-op for performance
      />
    </div>
  );
};

export default JoditEditorComponent;

// import React, { useState } from 'react';
// import JoditEditorComponent from './JoditEditorComponent';

// const App: React.FC = () => {
//   const [editorContent, setEditorContent] = useState('<p>Welcome to Jodit Editor!</p>');

//   const handleContentChange = (content: string) => {
//     setEditorContent(content);
//   };

//   return (
//     <div>
//       <h1>Jodit Editor Example</h1>
//       <JoditEditorComponent
//         placeholder="Start typing here..."
//         initialValue={editorContent}
//         onContentChange={handleContentChange}
//       />
//       <h2>Output:</h2>
//       <div dangerouslySetInnerHTML={{ __html: editorContent }} />
//     </div>
//   );
// };

// export default App;
