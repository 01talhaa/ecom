"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-[200px] border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700" /> 
});

// Make sure to import styles somewhere in your app
// This can be in layout.js or a parent component
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = '', 
  hasError = false,
  height = '200px'
}) {
  // Use client-side state to avoid hydration errors
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  
  // Set mounted to true when component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Update local state when prop value changes
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);
  
  // Handle editor changes
  const handleEditorChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };
  
  // Custom toolbar modules
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };
  
  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];
  
  // Add height to wrapper div style
  const wrapperStyle = {
    height: height,
    marginBottom: '20px'
  };
  
  // Only render the editor on the client side
  if (!mounted) {
    return (
      <div 
        className="border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700" 
        style={wrapperStyle}
      />
    );
  }
  
  return (
    <div 
      className={`quill-wrapper ${hasError ? 'quill-error' : ''}`}
      style={wrapperStyle}
    >
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleEditorChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}