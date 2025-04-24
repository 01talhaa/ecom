import React, { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Redo, Undo,
  Type, Heading1, Heading2, Heading3, Code
} from 'lucide-react';

const BasicInformation = ({
  formData,
  handleChange,
  categories,
  subcategories,
  brands,
  units,
  errors,
  selectedCategoryId,
}) => {
  // Initialize Tiptap editor with extended features
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Write a detailed description of your product...',
      }),
    ],
    content: formData.description, // Initial content
    onUpdate: ({ editor }) => {
      // Update the form data whenever the editor content changes
      const html = editor.getHTML();
      handleChange({
        target: {
          name: "description",
          value: html,
        },
      });
    },
  });

  // Update editor content when form data changes externally
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description);
    }
  }, [formData.description, editor]);

  // Function to add image
  const addImage = () => {
    const url = window.prompt('URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Function to add link
  const setLink = () => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);
      
      // cancelled
      if (url === null) {
        return;
      }
      
      // empty
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      
      // update link
      editor.chain().focus().extendMarkRange('link')
        .setLink({ href: url, target: '_blank' }).run();
    }
  };

  // Memoize the editor content for performance
  const MemoizedEditorContent = useMemo(() => {
    return <EditorContent editor={editor} />;
  }, [editor]);

  return (
    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-5 flex items-center border-b pb-3">
        <span className="border-l-4 border-blue-500 pl-3">Basic Information</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Name*
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Enter product name"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.productName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            } shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white`}
          />
          {errors.productName && (
            <p className="mt-1.5 text-sm text-red-500">{errors.productName}</p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Description*
          </label>
          {/* Tiptap Editor */}
          <div className="prose-editor rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mb-1">
            {editor && (
              <>
                <EditorToolbar editor={editor} addImage={addImage} setLink={setLink} />
                <div className="editor-content p-4 min-h-[200px] max-h-[400px] overflow-auto bg-white dark:bg-gray-700 outline-none">
                  {MemoizedEditorContent}
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use formatting tools to create a rich product description that highlights key features and benefits.
          </p>
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category*
          </label>
          <div className="relative">
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border appearance-none pr-10 ${
                errors.categoryId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          {errors.categoryId && (
            <p className="mt-1.5 text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategory*
          </label>
          <div className="relative">
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border appearance-none pr-10 ${
                errors.subCategoryId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          {errors.subCategoryId && (
            <p className="mt-1.5 text-sm text-red-500">{errors.subCategoryId}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand*
          </label>
          <div className="relative">
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border appearance-none pr-10 ${
                errors.brandId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          {errors.brandId && (
            <p className="mt-1.5 text-sm text-red-500">{errors.brandId}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unit*
          </label>
          <div className="relative">
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border appearance-none pr-10 ${
                errors.unitId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          {errors.unitId && (
            <p className="mt-1.5 text-sm text-red-500">{errors.unitId}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border appearance-none pr-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white"
            >
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={
              new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              )
                .toISOString()
                .split("T")[0]
            }
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 shadow-sm focus:outline-none focus:ring-2 transition-colors dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Featured Product Toggle */}
        <div className="col-span-2">
          <div className="flex items-center">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => 
                handleChange({
                  target: {
                    name: "featured",
                    value: e.target.checked,
                    type: "checkbox",
                    checked: e.target.checked
                  }
                })
              }
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label 
              htmlFor="featured" 
              className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Featured Product <span className="text-xs text-gray-500">(Will be displayed on the homepage)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Editor toolbar component
const EditorToolbar = ({ editor, addImage, setLink }) => {
  if (!editor) {
    return null;
  }

  // Group buttons for better organization
  const buttonGroups = [
    // Text style buttons
    [
      {
        icon: <Bold size={16} />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
        tooltip: "Bold (Ctrl+B)"
      },
      {
        icon: <Italic size={16} />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        tooltip: "Italic (Ctrl+I)"
      },
      {
        icon: <UnderlineIcon size={16} />,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
        tooltip: "Underline (Ctrl+U)"
      },
      {
        icon: <Strikethrough size={16} />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        tooltip: "Strikethrough"
      },
    ],
    // Heading buttons
    [
      {
        icon: <Type size={16} />,
        action: () => editor.chain().focus().setParagraph().run(),
        isActive: editor.isActive("paragraph"),
        tooltip: "Paragraph"
      },
      {
        icon: <Heading1 size={16} />,
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
        tooltip: "Heading 1"
      },
      {
        icon: <Heading2 size={16} />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        tooltip: "Heading 2"
      },
    ],
    // Alignment buttons
    [
      {
        icon: <AlignLeft size={16} />,
        action: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: editor.isActive({ textAlign: 'left' }),
        tooltip: "Align Left"
      },
      {
        icon: <AlignCenter size={16} />,
        action: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: editor.isActive({ textAlign: 'center' }),
        tooltip: "Align Center"
      },
      {
        icon: <AlignRight size={16} />,
        action: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: editor.isActive({ textAlign: 'right' }),
        tooltip: "Align Right"
      },
      {
        icon: <AlignJustify size={16} />,
        action: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: editor.isActive({ textAlign: 'justify' }),
        tooltip: "Justify"
      },
    ],
    // List buttons
    [
      {
        icon: <List size={16} />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
        tooltip: "Bullet List"
      },
      {
        icon: <ListOrdered size={16} />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
        tooltip: "Ordered List"
      },
    ],
    // Link and image buttons
    [
      {
        icon: <LinkIcon size={16} />,
        action: setLink,
        isActive: editor.isActive("link"),
        tooltip: "Insert Link"
      },
      {
        icon: <ImageIcon size={16} />,
        action: addImage,
        isActive: false,
        tooltip: "Insert Image"
      },
      {
        icon: <Code size={16} />,
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: editor.isActive('codeBlock'),
        tooltip: "Code Block"
      },
    ],
    // Undo/Redo buttons
    [
      {
        icon: <Undo size={16} />,
        action: () => editor.chain().focus().undo().run(),
        tooltip: "Undo (Ctrl+Z)",
        disabled: !editor.can().undo()
      },
      {
        icon: <Redo size={16} />,
        action: () => editor.chain().focus().redo().run(),
        tooltip: "Redo (Ctrl+Y)",
        disabled: !editor.can().redo()
      },
    ]
  ];

  return (
    <div className="editor-toolbar flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
      {buttonGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          <div className="flex items-center">
            {group.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                disabled={button.disabled}
                className={`p-1.5 rounded-md text-sm transition-colors ${
                  button.isActive 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                } ${button.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                title={button.tooltip}
              >
                {button.icon}
              </button>
            ))}
          </div>
          {groupIndex < buttonGroups.length - 1 && (
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BasicInformation;