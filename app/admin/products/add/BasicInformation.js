import React, { useEffect, useMemo, useState } from "react";
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
  Type, Heading1, Heading2, // Heading3 removed as not in toolbar
  Code
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

// --- Helper: Safely Parse JSON (Keep as is) ---
const safelyParseJson = async (response) => {
  try {
    if (!response.ok) {
      // Attempt to read error body for more context
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
      } catch (e) { /* Ignore */ }
      throw new Error(`API error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
    }
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn('Empty response received from API');
      // Decide if empty response is success or failure based on context
      // Assuming success for now if response.ok was true
      return { success: true, message: 'Empty response received but status OK', data: null };
    }
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Raw response:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (err) {
    throw err; // Re-throw the caught error
  }
};

// --- Helper: Flatten Nested Categories from V2 API ---
const flattenCategoriesApiData = (categories, level = 0, parentId = null) => {
    let flatList = [];
    (categories || []).forEach(category => {
        const currentParentId = parentId === 0 ? null : (parentId ? parentId.toString() : null);
        const categoryIdStr = category.categoryId.toString();

        flatList.push({
            id: categoryIdStr,
            name: category.categoryName,
            // Adjust parentId logic: V2 root parentId might be 0, treat as null for consistency
            parentId: category.parentId === 0 ? null : category.parentId?.toString() || null,
            level: level,
            hasChildren: Array.isArray(category.children) && category.children.length > 0,
            // Keep original children structure if needed elsewhere, but not strictly necessary for dropdowns
            // children: category.children
        });
        if (Array.isArray(category.children) && category.children.length > 0) {
            // Pass the current category's ID as the parentId for its children
            flatList = flatList.concat(flattenCategoriesApiData(category.children, level + 1, categoryIdStr));
        }
    });
    return flatList;
};


// --- Component Definition ---
const BasicInformation = ({
  formData,
  handleChange,
  // Removed categories, subcategories, selectedCategoryId, setSubcategories, fetchSubcategories props
  brands,
  units,
  errors,
}) => {
  const { getAuthToken } = useAuth();

  // --- State for Categories ---
  const [allCategories, setAllCategories] = useState([]); // Holds the FLATTENED list of all categories
  // No longer need availableSubcategories state separately
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryLevels, setCategoryLevels] = useState([]); // Track category selections at each level

  // --- Fetch All Categories on Mount (V2 API) ---
  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token is missing.");
        }

        const apiUrl = `/api/proxy/api/v2/category`; // V2 endpoint for all categories
        console.log(`Fetching all categories from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await safelyParseJson(response);
        console.log("Raw V2 Category API response:", data);

        // Adjust parsing based on potential actual structure
        // Assuming the categories are directly in data.data or data.data.result
        const categoriesData = data?.data?.result || data?.data;

        if (data.success && Array.isArray(categoriesData)) {
          const flattened = flattenCategoriesApiData(categoriesData); // Start flattening from root
          console.log("Flattened Categories:", flattened);
          setAllCategories(flattened);
        } else {
          throw new Error(data.message || "Failed to fetch or parse categories (check API response structure)");
        }
      } catch (error) {
        console.error("Error fetching all categories:", error);
        setCategoryError(error.message || "Could not load categories.");
        setAllCategories([]); // Clear categories on error
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchAllCategories();
  }, [getAuthToken]); // Depend only on getAuthToken


  // --- Effect to Build Category Hierarchy when formData or allCategories Changes ---
  useEffect(() => {
    if (!allCategories.length && !loadingCategories) {
      // If loading is finished and there are still no categories, show the first level selector as empty/error
      setCategoryLevels([{ selectedId: "", options: [] }]);
      return;
    }
    if (!allCategories.length) return; // Don't build if categories aren't loaded yet

    const levels = [];
    const path = [formData.categoryId, ...(formData.subCategoryPath || [])].filter(Boolean); // Full path including main category

    // Level 0: Top-level categories
    const topLevelOptions = allCategories.filter(c => c.parentId === null);
    levels.push({
      selectedId: formData.categoryId || "",
      options: topLevelOptions,
      level: 0
    });

    let currentParentId = formData.categoryId;

    // Build subsequent levels based on the path
    for (let i = 0; i < path.length; i++) {
        const levelParentId = path[i];
        if (!levelParentId) break; // Stop if we hit an empty selection in the path

        const children = allCategories.filter(c => c.parentId === levelParentId);

        if (children.length > 0) {
            const selectedInChildren = path[i + 1] || ""; // The selection for *this* level's dropdown
            levels.push({
              selectedId: selectedInChildren,
              options: children,
              level: i + 1
            });
            currentParentId = selectedInChildren; // Next parent is the current selection
        } else {
             // If the last selected category has no children, stop adding levels
             currentParentId = null; // Ensure no further levels are added
             break;
        }
    }

    // Add one more empty level if the *last selected category in the path* has children
    const lastSelectedIdInPath = path[path.length - 1];
    if (lastSelectedIdInPath) {
        const lastSelectedCategory = allCategories.find(c => c.id === lastSelectedIdInPath);
        if (lastSelectedCategory && lastSelectedCategory.hasChildren) {
            const finalChildren = allCategories.filter(c => c.parentId === lastSelectedIdInPath);
            if (finalChildren.length > 0 && !levels.some(l => l.options === finalChildren)) {
                // Only add if children exist and we haven't already added this level
                 levels.push({
                    selectedId: "",
                    options: finalChildren,
                    level: path.length // The next level index
                 });
            }
        }
    }

    // console.log("Built Category Levels:", levels);
    setCategoryLevels(levels);

  }, [formData.categoryId, formData.subCategoryPath, allCategories, loadingCategories]); // Rerun when form data or categories change


  // Handle cascading category change
  const handleCategoryChange = (levelIndex, selectedCategoryId) => {
    const currentPath = [formData.categoryId, ...(formData.subCategoryPath || [])].filter(Boolean);

    let newMainCategoryId = formData.categoryId;
    let newSubCategoryPath = [...(formData.subCategoryPath || [])];

    if (levelIndex === 0) {
      // Changed the main category selector
      newMainCategoryId = selectedCategoryId;
      newSubCategoryPath = []; // Reset the entire sub-path
    } else {
      // Changed a subcategory selector (levelIndex corresponds to position in levels array, which is 1-based for subcats)
      // The index in the subCategoryPath array is levelIndex - 1
      const pathIndex = levelIndex - 1;

      // Update the path at this level
      newSubCategoryPath[pathIndex] = selectedCategoryId;

      // Truncate the path after this level (remove deeper selections)
      newSubCategoryPath.length = pathIndex + 1;

      // Remove trailing empty selections if user selected "-- Select --"
       if (!selectedCategoryId) {
           newSubCategoryPath.length = pathIndex;
       }

    }

    // Update formData
    handleChange({ target: { name: "categoryId", value: newMainCategoryId } });
    handleChange({ target: { name: "subCategoryPath", value: newSubCategoryPath } });

    // Update legacy subCategoryId (deepest selected ID)
    const deepestId = [...newSubCategoryPath].filter(Boolean).pop() || newMainCategoryId || "";
    // Ensure we don't set subCategoryId same as categoryId if no subCat is selected
    const finalSubCategoryId = (deepestId === newMainCategoryId && newSubCategoryPath.length === 0) ? "" : deepestId;

    // Only trigger update if the value actually changes
    if (formData.subCategoryId !== finalSubCategoryId) {
        handleChange({ target: { name: "subCategoryId", value: finalSubCategoryId } });
    }
  };


  // --- Tiptap Editor Setup (Keep as is) ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          heading: { levels: [1, 2, 3] }, // Ensure headings are configured if used
      }),
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image, // Basic image support
      Placeholder.configure({ placeholder: 'Write a detailed description...' }),
    ],
    content: formData.description || '', // Ensure initial content is set
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Prevent updating state if content hasn't actually changed (e.g., focus/blur)
      // Also check if the new html is just an empty paragraph, treat as empty
      const isEmptyContent = html === '<p></p>';
      const currentValue = formData.description || '';

      if (html !== currentValue && !(isEmptyContent && currentValue === '')) {
           handleChange({ target: { name: "description", value: isEmptyContent ? '' : html } });
      }
    },
  });

  // Sync formData.description -> editor
  useEffect(() => {
      if (editor && !editor.isDestroyed) {
          const editorHTML = editor.getHTML();
          const formHTML = formData.description || '';
           // Avoid unnecessary updates, especially converting '' to '<p></p>' and back
          if (formHTML !== editorHTML && !(formHTML === '' && editorHTML === '<p></p>')) {
             // Use 'replace' to avoid potential cursor jumps on external updates
             editor.commands.setContent(formHTML, false); // false = don't emit update event
          }
      }
       // No cleanup needed here if editor lifetime is tied to component
  }, [formData.description, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
     return () => {
        editor?.destroy();
     };
  }, [editor]);


  const addImage = () => {
    const url = window.prompt('Enter Image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    }
  };

  // --- Memoized Editor Content ---
  // Memoization might not be strictly necessary here if EditorContent handles updates efficiently
  // const MemoizedEditorContent = React.memo(EditorContent); // Alternative if needed

  // --- Render Logic ---
  return (
    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow"> {/* Consistent padding */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
        <span className="border-l-4 border-blue-500 pl-3">Basic Information</span>
      </h2>

      {/* Category Loading/Error State */}
      {loadingCategories && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Loading categories...</p>}
      {categoryError && !loadingCategories && <p className="text-sm text-red-600 dark:text-red-400 mb-4">Error: {categoryError}</p>}

      {/* Main Grid for Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> {/* Adjusted gaps */}

        {/* Product Name */}
        <div className="md:col-span-2">
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"> {/* Use htmlFor */}
            Product Name*
          </label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName || ''} // Ensure controlled component
            onChange={handleChange}
            placeholder="e.g., Wireless Bluetooth Headphones"
            className={`w-full px-3 py-2 rounded-md border ${ // Standard input padding
              errors.productName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            } shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white`}
          />
          {errors.productName && (
            <p className="mt-1 text-xs text-red-500">{errors.productName}</p> // Smaller error text
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Product Description*
          </label>
          <div className={`prose-editor rounded-md overflow-hidden border ${
             errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
          } focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500`}> {/* Apply focus ring to wrapper */}
            {editor && (
              <>
                <EditorToolbar editor={editor} addImage={addImage} setLink={setLink} />
                 {/* Apply bg color here */}
                 <div className="editor-content p-3 min-h-[150px] max-h-[350px] overflow-y-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 prose dark:prose-invert prose-sm max-w-none focus:outline-none">
                   {/* Render EditorContent directly */}
                   <EditorContent editor={editor} />
                 </div>
              </>
            )}
          </div>
           {/* Optional: Help text */}
           <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
               Use the toolbar for formatting. Include key features and benefits.
           </p>
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category Selection Levels */}
        {/* Render all category level dropdowns sequentially. Each takes up one grid column. */}
        {categoryLevels.map((level, index) => (
          <div key={`category-level-${index}`} className=""> {/* REMOVED conditional col-span */}
            <label
              htmlFor={`category-level-${index}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              {index === 0 ? "Category*" : `Subcategory Level ${index}`}
              {index > 0 && level.options.length === 0 && <span className="text-xs text-gray-400"> (No further subcategories)</span>}
            </label>
            <div className="relative">
              <select
                id={`category-level-${index}`}
                name={`category-level-${index}`} // Name might not be needed if controlled only by state/handler
                value={level.selectedId || ""}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                // Disable if loading (only for first level), or if previous level isn't selected, or if no options
                disabled={
                    (index === 0 && loadingCategories) ||
                    (index > 0 && !categoryLevels[index - 1]?.selectedId) ||
                    level.options.length === 0
                 }
                className={`w-full px-3 py-2 rounded-md border appearance-none pr-8 ${
                  index === 0 && errors.categoryId ? "border-red-500" : "border-gray-300 dark:border-gray-600" // Apply error only to first level for clarity
                } focus:ring-blue-500 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500
                   transition-colors dark:bg-gray-700 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {index === 0
                    ? loadingCategories ? "Loading..." : "Select Category"
                    : level.options.length === 0
                      ? "No subcategories"
                      : `Select Level ${index}`
                  }
                </option>
                {level.options.map((category) => (
                  <option key={category.id} value={category.id}>
                    {/* Optionally add indentation based on level if needed, but might complicate things */}
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </div>
            </div>
            {/* Show categoryId error only below the first dropdown */}
            {index === 0 && errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
            {/* You might want a similar error check for the *last selected* subcategory if that's required */}
             {index > 0 && index === categoryLevels.length -1 && errors.subCategoryId && level.selectedId && (
                <p className="mt-1 text-xs text-red-500">{errors.subCategoryId}</p>
             )}
          </div>
        ))}

        {/* Brand (Keep as is) */}
        <div>
          <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Brand*
          </label>
          <div className="relative">
            <select
              id="brandId"
              name="brandId"
              value={formData.brandId || ''} // Ensure controlled component
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border appearance-none pr-8 ${ // Standard padding
                errors.brandId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Brand</option>
              {(brands || []).map((brand) => ( // Add safety check for brands array
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </div>
          </div>
          {errors.brandId && (
            <p className="mt-1 text-xs text-red-500">{errors.brandId}</p>
          )}
        </div>

        {/* Unit (Keep as is) */}
        <div>
          <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Unit*
          </label>
          <div className="relative">
            <select
              id="unitId"
              name="unitId"
              value={formData.unitId || ''} // Ensure controlled component
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border appearance-none pr-8 ${ // Standard padding
                errors.unitId
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select Unit</option>
              {(units || []).map((unit) => ( // Add safety check for units array
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </div>
          </div>
          {errors.unitId && (
            <p className="mt-1 text-xs text-red-500">{errors.unitId}</p>
          )}
        </div>

        {/* Status (Keep as is - maybe adjust options if needed) */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              name="status"
              // Ensure value matches one of the options exactly
              value={formData.status || 'Available'} // Default to 'Available' if undefined/empty
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border appearance-none pr-8 border-gray-300 dark:border-gray-600 focus:ring-blue-500 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
            >
              {/* Ensure these values match what the backend expects */}
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Coming Soon">Coming Soon</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Expiry Date (Consider making optional or default value handling) */}
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Expiry Date <span className="text-xs text-gray-400">(Optional)</span>
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            // Only set value if formData.expiryDate exists and is valid, otherwise leave it empty
            value={formData.expiryDate ? formData.expiryDate.split("T")[0] : ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
            // Add min date if needed: min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Featured Product Toggle (Keep as is) */}
        <div className="md:col-span-2">
          <div className="flex items-center mt-2"> {/* Added top margin */}
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={!!formData.featured} // Ensure boolean value
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "featured",
                    value: e.target.checked, // Pass boolean directly
                    type: "checkbox",
                    // 'checked' is redundant here if value is boolean
                  }
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mark as Featured Product
              <span className="block text-xs text-gray-500 dark:text-gray-400">Featured products may appear on the homepage or special sections.</span>
            </label>
          </div>
        </div>
      </div> {/* End Main Grid */}
    </div>
  );
};


// --- Editor Toolbar Component (Keep as is, ensure icons match used features) ---
const EditorToolbar = ({ editor, addImage, setLink }) => {
  if (!editor) return null;

  const buttonGroups = [
    // Text style
    [
      { icon: <Bold size={16} />, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), tooltip: "Bold" },
      { icon: <Italic size={16} />, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), tooltip: "Italic" },
      { icon: <UnderlineIcon size={16} />, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive("underline"), tooltip: "Underline" },
      { icon: <Strikethrough size={16} />, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike"), tooltip: "Strikethrough" },
    ],
    // Heading
    [
      { icon: <Type size={16} />, action: () => editor.chain().focus().setParagraph().run(), isActive: editor.isActive("paragraph"), tooltip: "Paragraph" },
      { icon: <Heading1 size={16} />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive("heading", { level: 1 }), tooltip: "Heading 1" },
      { icon: <Heading2 size={16} />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }), tooltip: "Heading 2" },
      // Add H3 if needed and configured in StarterKit
    ],
    // Alignment
    [
      { icon: <AlignLeft size={16} />, action: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }), tooltip: "Align Left" },
      { icon: <AlignCenter size={16} />, action: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }), tooltip: "Align Center" },
      { icon: <AlignRight size={16} />, action: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }), tooltip: "Align Right" },
      { icon: <AlignJustify size={16} />, action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: editor.isActive({ textAlign: 'justify' }), tooltip: "Justify" },
    ],
    // Lists
    [
      { icon: <List size={16} />, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList"), tooltip: "Bullet List" },
      { icon: <ListOrdered size={16} />, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList"), tooltip: "Ordered List" },
    ],
    // Insertions
    [
      { icon: <LinkIcon size={16} />, action: setLink, isActive: editor.isActive("link"), tooltip: "Insert Link" },
      { icon: <ImageIcon size={16} />, action: addImage, tooltip: "Insert Image" },
      { icon: <Code size={16} />, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock'), tooltip: "Code Block" },
    ],
    // History
    [
      { icon: <Undo size={16} />, action: () => editor.chain().focus().undo().run(), tooltip: "Undo", disabled: !editor.can().undo() },
      { icon: <Redo size={16} />, action: () => editor.chain().focus().redo().run(), tooltip: "Redo", disabled: !editor.can().redo() },
    ]
  ];

  return (
     <div className="editor-toolbar flex flex-wrap items-center gap-x-1 gap-y-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 sticky top-0 z-10"> {/* Added sticky */}
      {buttonGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          <div className="flex items-center space-x-0.5"> {/* Reduced space */}
            {group.map((button, index) => (
              <button
                key={index}
                type="button" // Add type="button"
                onClick={button.action}
                disabled={button.disabled}
                className={`p-1.5 rounded text-sm transition-colors ${
                  button.isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                } ${button.disabled ? "opacity-40 cursor-not-allowed" : ""}
                  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50`}
                title={button.tooltip}
              >
                {button.icon}
              </button>
            ))}
          </div>
          {/* Divider */}
          {groupIndex < buttonGroups.length - 1 && (
             <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BasicInformation;