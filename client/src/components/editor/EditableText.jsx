import React from 'react';

export default function EditableText({ 
 isEditable, 
 value, 
 onChange, 
 className = '', 
 style = {}, 
 tagName = 'span',
 ...props 
}) {
 const Tag = tagName;
 
 if (!isEditable) {
 return <Tag className={className} style={style} {...props}>{value}</Tag>;
 }

 const handleBlur = (e) => {
 const text = e.target.innerText.trim();
 if (text !== value) {
 onChange(text);
 }
 };

 return (
 <Tag
 contentEditable={true}
 suppressContentEditableWarning={true}
 onBlur={handleBlur}
 className={`${className} outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 hover:bg-blue-50/25 cursor-text`}
 style={style}
 {...props}
 >
 {value}
 </Tag>
 );
}
