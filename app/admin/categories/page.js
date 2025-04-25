// src/app/admin/categories/page.tsx (or wherever your component resides)
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, ChevronRight, ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// --- Existing API Logic and State Management (Keep as is) ---
const CLIENT_NAME = "ck";
const useV2Api = () => CLIENT_NAME.toLowerCase() === "ck";

const safelyParseJson = async (response) => {
  // ... (Keep your existing safelyParseJson function)
    try {
    // First check if response is ok
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Get the response text first

    const text = await response.text();

    // If empty response, return a default structure
    if (!text || text.trim() === '') {
      console.warn('Empty response received from API');
      return { success: false, message: 'Empty response received from server' };
    }

    // Try to parse the text as JSON
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Raw response:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (err) {
    throw err;
  }
};

// --- Component Start ---
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    parentId: "",
    description: "",
    status: true
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAuthToken } = useAuth();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // --- Existing Fetch Logic (Keep as is) ---
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories(page = 1, limit = 10) {
    setLoading(true);
    setError(null);
    console.log(`Fetching categories - Page: ${page}, Limit: ${limit}`); // Added log

    try {
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token is missing. Please log in again.");
            setLoading(false);
            return;
        }

        let apiUrl = `/api/proxy/api/`;
        if (useV2Api()) {
            console.log("Using V2 API for categories");
            apiUrl += `v2/category?page=${page}&limit=${limit}`;
        } else {
            console.log("Using V1 API for categories");
            apiUrl += `v1/category?page=${page}&limit=${limit}`;
        }

        console.log(`Fetching from URL: ${apiUrl}`); // Log the final URL

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response Status: ${response.status}`); // Log response status

        const data = await safelyParseJson(response);
        console.log("API response data:", data); // Log the parsed data

        if (data.success) {
            let formattedCategories = [];
            let meta = data.data?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 }; // Default meta if missing

            if (useV2Api()) {
                // Process V2 data (nested)
                const flattenCategories = (categories, level = 0) => {
                    (categories || []).forEach(category => {
                        formattedCategories.push({
                            id: category.categoryId.toString(),
                            name: category.categoryName,
                            slug: category.categoryName.toLowerCase().replace(/\s+/g, "-"),
                            parentId: category.parentId === 0 ? null : category.parentId.toString(),
                            description: category.description || "",
                            status: category.status !== undefined ? category.status : true,
                            level: level,
                            isSubcategory: category.parentId !== 0,
                            v2Data: true,
                            hasChildren: Array.isArray(category.children) && category.children.length > 0
                        });
                        if (Array.isArray(category.children) && category.children.length > 0) {
                            flattenCategories(category.children, level + 1);
                        }
                    });
                };
                flattenCategories(data.data?.result || []); // Safely access result
            } else {
                // Process V1 data (flat)
                const categoriesData = data.data?.result || []; // Safely access result
                formattedCategories = categoriesData.map(cat => ({
                    id: cat.categoryId.toString(),
                    name: cat.categoryName,
                    slug: cat.categoryName.toLowerCase().replace(/\s+/g, "-"),
                    status: cat.status !== undefined ? cat.status : true,
                    parentId: null,
                    description: cat.description || "",
                    imageUrl: cat.imageUrl || null,
                    createdBy: cat.createdBy,
                    isSubcategory: false,
                    v2Data: false
                }));
                // Fetch and merge V1 subcategories if needed (ensure fetchSubcategories handles V1/V2 logic)
                const subcategories = await fetchSubcategories();
                formattedCategories = [...formattedCategories, ...subcategories];
            }

            console.log("Formatted Categories:", formattedCategories); // Log formatted categories
            console.log("Pagination Meta:", meta); // Log pagination meta

            setCategories(formattedCategories);
            setPagination({
                page: meta.page || 1,
                limit: meta.limit || 10,
                total: meta.total || 0,
                totalPages: meta.totalPage || 1
            });

        } else {
             // Log the failure message from the API
             console.error("API Error:", data.message || "Failed to fetch categories");
            throw new Error(data.message || "Failed to fetch categories");
        }

    } catch (err) {
        console.error("Error in fetchCategories:", err);
        setError(err.message || "An error occurred while fetching categories");
    } finally {
        setLoading(false);
    }
}

async function fetchSubcategories() {
    // Only fetch if using V1 API
    if (useV2Api()) {
        console.log("Skipping separate subcategory fetch for V2 API");
        return [];
    }

    console.log("Using V1 API - Fetching subcategories");
    try {
        const token = getAuthToken();
        if (!token) {
            console.warn("Auth token missing for subcategory fetch.");
            // Optionally set an error or just return empty
            // setError("Authentication token is missing.");
            return [];
        }

        const response = await fetch(`/api/proxy/api/v1/subcategory`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await safelyParseJson(response);

        if (data.success) {
            const subcategoriesData = data.data?.result || [];
            const formattedSubcategories = subcategoriesData.map(subcat => ({
                id: subcat.subCategoryId.toString(),
                name: subcat.subCategoryName,
                slug: subcat.subCategoryName.toLowerCase().replace(/\s+/g, "-"),
                status: subcat.status !== undefined ? subcat.status : true,
                parentId: subcat.categoryId.toString(),
                description: subcat.description || "",
                isSubcategory: true,
                v2Data: false
            }));
            console.log("Fetched V1 Subcategories:", formattedSubcategories);
            return formattedSubcategories;
        } else {
            console.warn("Failed to fetch V1 subcategories:", data.message);
            return [];
        }
    } catch (err) {
        console.error("Error fetching V1 subcategories:", err);
        // Optionally set an error state here
        // setError("Error fetching subcategories.");
        return [];
    }
}


  // --- Existing Handler Functions (Keep as is) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    console.log("handleAddSubmit called. Submitting:", formData); // Log form data

    try {
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token is missing. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        let apiUrl = "/api/proxy/api/";
        let payload = {};
        let method = "POST";

        if (useV2Api()) {
            console.log("Using V2 API for adding category");
            apiUrl += "v2/category";
            payload = {
                categoryName: formData.categoryName,
                imageUrl: formData.imageUrl || "", // Assuming imageUrl might be added
                parentId: formData.parentId ? parseInt(formData.parentId) : 0
            };
            // V2 might require description separately or not at all, adjust as needed
            // payload.description = formData.description;
        } else {
            console.log("Using V1 API for adding category/subcategory");
            const isSubcategory = formData.parentId !== "";
            if (isSubcategory) {
                apiUrl += "v1/subcategory";
                payload = {
                    subCategoryName: formData.categoryName,
                    categoryId: parseInt(formData.parentId),
                    status: formData.status,
                    createdBy: 3 // Example User ID
                };
                if (formData.description) payload.description = formData.description;
            } else {
                apiUrl += "v1/category";
                payload = {
                    categoryName: formData.categoryName,
                    status: formData.status,
                    createdBy: 3 // Example User ID
                };
                if (formData.description) payload.description = formData.description;
            }
        }

        console.log(`Sending ${method} request to ${apiUrl} with payload:`, payload); // Log request details

        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`); // Log response status

        const data = await safelyParseJson(response);
        console.log("API Add Response:", data); // Log API response

        if (data.success) {
            alert("Category/Subcategory created successfully!");
            setShowAddForm(false);
            setFormData({ categoryName: "", parentId: "", description: "", status: true }); // Reset form
            fetchCategories(pagination.page, pagination.limit); // Refresh list to current page
        } else {
            console.error("API Add Error:", data.message || "Failed to create");
            throw new Error(data.message || "Failed to create category/subcategory");
        }

    } catch (err) {
        console.error("Error in handleAddSubmit:", err);
        setError(err.message || "An error occurred while creating.");
    } finally {
        setIsSubmitting(false);
    }
};

const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentCategory) {
        setError("No category selected for editing.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    console.log(`handleEditSubmit called for category ID: ${currentCategory.id}. Submitting:`, formData);

    try {
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token is missing.");
            setIsSubmitting(false);
            return;
        }

        let apiUrl = "/api/proxy/api/";
        let payload = {};
        let method = "PUT"; // Typically PUT for updates

        if (useV2Api()) {
            console.log("Using V2 API for updating category");
            // --- V2 UPDATE LOGIC ---
            // IMPORTANT: The provided V2 swagger does not show a dedicated PUT/PATCH for updates.
            // Assuming a hypothetical endpoint `/v2/category/{id}` exists.
            // If not, this part needs adjustment based on the actual available V2 API.
            if (!currentCategory.id) {
                 throw new Error("Cannot update category without an ID (V2).");
            }
            apiUrl += `v2/category/${currentCategory.id}`;
            payload = {
                // Include fields the V2 update endpoint expects.
                // Might be just categoryName, parentId, etc.
                categoryName: formData.categoryName,
                parentId: formData.parentId ? parseInt(formData.parentId) : 0,
                 // Add other fields like status, description if the V2 API supports them in updates
                // status: formData.status,
                // description: formData.description,
            };
             console.warn("V2 Update endpoint is assumed. Verify API documentation.");
            // alert("Update functionality for V2 API needs verification based on actual endpoint availability.");
            // setIsSubmitting(false); // Remove this line if you proceed with the assumed endpoint
            // return; // Remove this line if you proceed with the assumed endpoint
            // --- END V2 UPDATE LOGIC (Assumed) ---

        } else {
            console.log("Using V1 API for updating category/subcategory");
            const isSubcategory = currentCategory.isSubcategory === true;

            if (isSubcategory) {
                apiUrl += `v1/subcategory/${currentCategory.id}`;
                payload = {
                    subCategoryId: parseInt(currentCategory.id), // Required by V1 subcategory PUT
                    subCategoryName: formData.categoryName,
                    categoryId: parseInt(formData.parentId), // Parent ID might be required
                    status: formData.status,
                    modifiedBy: 3 // Example User ID
                };
                 if (formData.description) payload.description = formData.description;
            } else {
                apiUrl += `v1/category/${currentCategory.id}`;
                payload = {
                    categoryId: parseInt(currentCategory.id), // Required by V1 category PUT
                    categoryName: formData.categoryName,
                    status: formData.status,
                    modifiedBy: 3 // Example User ID
                };
                 if (formData.description) payload.description = formData.description;
            }
        }

         console.log(`Sending ${method} request to ${apiUrl} with payload:`, payload);

        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`);

        const data = await safelyParseJson(response);
        console.log("API Edit Response:", data);

        if (data.success) {
            alert("Category/Subcategory updated successfully!");
            setShowEditForm(false);
            setCurrentCategory(null);
            setFormData({ categoryName: "", parentId: "", description: "", status: true }); // Reset form
            fetchCategories(pagination.page, pagination.limit); // Refresh list
        } else {
            console.error("API Edit Error:", data.message || "Failed to update");
            throw new Error(data.message || "Failed to update category/subcategory");
        }

    } catch (err) {
        console.error("Error in handleEditSubmit:", err);
        setError(err.message || "An error occurred while updating.");
    } finally {
        setIsSubmitting(false);
    }
};

const handleDelete = async (categoryId, isSub = false) => { // Renamed isSubcategory parameter
    const entityType = isSub ? "subcategory" : "category";
    console.log(`handleDelete called for ${entityType} ID: ${categoryId}`);

    if (!window.confirm(`Are you sure you want to delete this ${entityType}? This might also delete its children.`)) {
        return;
    }

    // No need to set loading=true here, as fetchCategories will handle it if successful
    setError(null);

    try {
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }

        let apiUrl = "/api/proxy/api/";
        let method = "DELETE";

        if (useV2Api()) {
            console.log(`Using V2 API to delete category ID: ${categoryId}`);
            // V2 uses the same endpoint for categories and subcategories
             apiUrl += `v2/category/${categoryId}`;
             // V2 delete might require a payload (e.g., modifiedBy), check API docs
             // payload = { modifiedBy: 3 };
        } else {
            console.log(`Using V1 API to delete ${entityType} ID: ${categoryId}`);
            if (isSub) {
                apiUrl += `v1/subcategory/${categoryId}`;
            } else {
                apiUrl += `v1/category/${categoryId}`;
            }
        }

        console.log(`Sending ${method} request to ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
             // Add body here if V2 delete requires it
             // body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`);

        const data = await safelyParseJson(response);
        console.log(`API Delete Response (${entityType}):`, data);

        if (data.success) {
            alert(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully!`);
            // Optimistic UI update (remove immediately) - fetchCategories will confirm later
             setCategories(prev => {
                const toDeleteIds = new Set([categoryId]);
                // If deleting a parent, find all descendant IDs to remove them too
                 if (!isSub) {
                    const findDescendants = (parentId) => {
                        prev.forEach(cat => {
                            if (cat.parentId === parentId) {
                                toDeleteIds.add(cat.id);
                                findDescendants(cat.id); // Recursively find children
                            }
                        });
                    };
                    findDescendants(categoryId);
                }
                return prev.filter(cat => !toDeleteIds.has(cat.id));
            });
            // Consider fetching categories again to ensure consistency, especially if total count changes pagination
            fetchCategories(pagination.page, pagination.limit);
        } else {
             console.error(`API Delete Error (${entityType}):`, data.message || "Failed to delete");
            throw new Error(data.message || `Failed to delete ${entityType}`);
        }

    } catch (err) {
        console.error(`Error deleting ${entityType}:`, err);
        setError(err.message || `An error occurred while deleting.`);
    } finally {
        // setLoading(false); // No need to set loading false here
    }
};


  const handleEdit = (category) => {
    console.log("Editing category:", category); // Log the category being edited
    setCurrentCategory(category);
    setFormData({
      categoryName: category.name,
      // Ensure parentId is correctly set (might be null, '0', or a string ID)
      parentId: category.parentId || "",
      description: category.description || "",
      status: category.status !== undefined ? category.status : true
    });
    setShowEditForm(true);
    setShowAddForm(false); // Ensure add form is closed
  };

const toggleExpand = async (categoryId) => {
    console.log(`Toggling expand for category ID: ${categoryId}`);
    const isCurrentlyExpanded = expandedCategories[categoryId];

    setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: !isCurrentlyExpanded
    }));

    // For V2, if expanding and children haven't been loaded for this specific category yet, fetch them.
    // We check if children for this ID already exist in the `categories` state.
    // This prevents re-fetching if children were already loaded via the initial fetch or a previous expand.
    if (useV2Api() && !isCurrentlyExpanded) {
        const childrenExist = categories.some(cat => cat.parentId === categoryId);
        if (!childrenExist) {
            console.log(`Children for ${categoryId} not found locally, fetching from API.`);
             // Check if the category *can* have children according to its data
            const parentCat = categories.find(c => c.id === categoryId);
             if (parentCat && parentCat.hasChildren) { // Check the hasChildren flag from initial fetch
                 fetchChildCategories(categoryId);
             } else {
                console.log(`Category ${categoryId} is marked as having no children, not fetching.`);
            }
        } else {
            console.log(`Children for ${categoryId} already exist locally, not re-fetching.`);
        }
    }
};

const fetchChildCategories = async (parentId) => {
    // Only applicable for V2 lazy loading
    if (!useV2Api()) return;

    console.log(`Fetching V2 children for category ID: ${parentId}`);
    // Consider adding a loading indicator specific to the expanding row if needed
    // setLoadingChildren(parentId, true); // Example state management for row loading

    try {
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }

        // --- V2 GET CHILD CATEGORIES ---
        // IMPORTANT: Verify the correct V2 endpoint for getting children.
        // Assuming `/v2/category/GetChilds/{parentId}` based on previous code. Adjust if different.
        const apiUrl = `/api/proxy/api/v2/category/GetChilds/${parentId}`;
        console.log(`Fetching children from: ${apiUrl}`);
        // --- END V2 GET CHILD CATEGORIES ---


        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

         console.log(`Child fetch response status for ${parentId}: ${response.status}`);

        const data = await safelyParseJson(response);
        console.log(`Children data received for ${parentId}:`, data);

        if (data.success) {
            const childrenData = data.data || []; // V2 GetChilds might return data directly as an array
            if (Array.isArray(childrenData) && childrenData.length > 0) {
                const parentLevel = categories.find(cat => cat.id === parentId)?.level ?? -1; // Find parent level

                const formattedChildren = childrenData.map(child => ({
                    id: child.categoryId.toString(),
                    name: child.categoryName,
                    slug: child.categoryName.toLowerCase().replace(/\s+/g, "-"),
                    parentId: child.parentId === 0 ? null : child.parentId.toString(), // Should match parentId
                    description: child.description || "",
                    status: child.status !== undefined ? child.status : true,
                    level: parentLevel + 1, // Set level based on parent
                    isSubcategory: true, // Children are always subcategories relative to parent
                    v2Data: true,
                    // Check if these children can also have children based on API response
                    hasChildren: Array.isArray(child.children) && child.children.length > 0
                }));

                console.log(`Formatted children for ${parentId}:`, formattedChildren);

                // Add children to state, preventing duplicates
                setCategories(prev => {
                    const existingIds = new Set(prev.map(cat => cat.id));
                    const newChildren = formattedChildren.filter(child => !existingIds.has(child.id));
                    return [...prev, ...newChildren];
                });
            } else {
                console.log(`No children returned for category ${parentId}.`);
                 // Optional: Mark parent as having no children definitively if API confirms empty array
                 setCategories(prev => prev.map(cat => cat.id === parentId ? {...cat, hasChildren: false} : cat));
            }
        } else {
            console.warn(`Failed to fetch children for ${parentId}:`, data.message);
             // Optionally show a specific error for child fetching failure
             // setError(`Failed to load subcategories for parent ID ${parentId}.`);
        }
    } catch (err) {
        console.error(`Error fetching children for ${parentId}:`, err);
        setError(`Error loading subcategories for parent ID ${parentId}.`);
    } finally {
        // setLoadingChildren(parentId, false); // Turn off row-specific loading indicator
    }
};


  // Derived state for forms (memoize if performance becomes an issue)
  const parentCategoryOptions = categories.filter(cat =>
     // For V2: Any category can potentially be a parent (except itself and its descendants - more complex check needed for descendants)
     // For V1: Only categories where isSubcategory is false
     (useV2Api() ? true : !cat.isSubcategory) &&
     cat.id !== (currentCategory?.id || '0') // Cannot be its own parent
   );

  // --- RENDER LOGIC ---

  // Pagination Component (Improved Styling)
const PaginationControls = () => {
    if (pagination.totalPages <= 1) return null;

    // Determine page numbers to display (e.g., current +/- 2, plus first/last)
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const pageNeighbours = 1; // How many pages to show around the current page

    // Always show first page
    if (currentPage > pageNeighbours + 2) {
        pages.push(1);
        if (currentPage > pageNeighbours + 3) {
            pages.push('...'); // Ellipsis if there's a gap
        }
    } else if (currentPage === pageNeighbours + 2) {
         pages.push(1);
    }

    // Pages around current
    for (let i = Math.max(1, currentPage - pageNeighbours); i <= Math.min(totalPages, currentPage + pageNeighbours); i++) {
         if (!pages.includes(i)) { // Avoid duplicates if near start/end
            pages.push(i);
        }
    }

    // Always show last page
     if (currentPage < totalPages - pageNeighbours - 1) {
         if (currentPage < totalPages - pageNeighbours - 2) {
             pages.push('...'); // Ellipsis
         }
         pages.push(totalPages);
     } else if (currentPage === totalPages - pageNeighbours - 1) {
         pages.push(totalPages);
     }


    return (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
            {/* Info Text */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                 {/* Dynamically calculate shown range */}
                 Showing{' '}
                 <span className="font-medium">
                     {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                 </span>{' '}
                 to{' '}
                 <span className="font-medium">
                     {Math.min(pagination.page * pagination.limit, pagination.total)}
                 </span>{' '}
                 of <span className="font-medium">{pagination.total}</span> results
            </div>

            {/* Buttons */}
            <div className="flex space-x-1 items-center">
                {/* Previous Button */}
                <button
                    onClick={() => fetchCategories(pagination.page - 1, pagination.limit)}
                    disabled={pagination.page <= 1 || loading}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous Page"
                >
                    Previous
                </button>

                {/* Page Number Buttons */}
                {pages.map((page, i) =>
                     page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => fetchCategories(page, pagination.limit)}
                            disabled={pagination.page === page || loading}
                            className={`px-3 py-1.5 border text-sm font-medium rounded-md ${
                                pagination.page === page
                                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700 z-10' // Added z-index
                                    : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                             aria-current={pagination.page === page ? 'page' : undefined}
                             aria-label={`Page ${page}`}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next Button */}
                <button
                    onClick={() => fetchCategories(pagination.page + 1, pagination.limit)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     aria-label="Next Page"
                >
                    Next
                </button>
            </div>
        </div>
    );
};


  // Loading State
  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /> {/* Slightly larger spinner */}
      </div>
    );
  }

  // Main Component Render
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"> {/* Increased padding on larger screens */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6"> {/* Adjusted margin */}
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
          Categories
        </h1>
        <div className="flex space-x-2"> {/* Increased spacing */}
          {/* 
          {!enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                    Enable this section to add variant details if applicable.
                </p>
            )}
          */}
          <button
            onClick={() => fetchCategories(1, pagination.limit)} // Refresh goes to page 1
            disabled={loading}
            className="flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium" // Standardized button style
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {/* Consistent icon size */}
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowEditForm(false);
              setCurrentCategory(null); // Clear currentCategory when opening add form
              setFormData({ categoryName: "", parentId: "", description: "", status: true }); // Reset form
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm" // Standardized button style
          >
            <Plus className="w-4 h-4 mr-1.5" /> {/* Consistent icon size and margin */}
            Add Category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-md flex items-start shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" /> {/* Slightly larger icon */}
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={() => fetchCategories(pagination.page, pagination.limit)} // Retry current page
              className="mt-2 text-sm text-red-800 dark:text-red-300 underline hover:text-red-900 dark:hover:text-red-200"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Container */}
      {(showAddForm || showEditForm) && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4"> {/* Larger title */}
            {showEditForm ? "Edit Category" : "Add New Category"}
          </h2>
          <form id={showEditForm ? "editCategoryForm" : "addCategoryForm"} onSubmit={showEditForm ? handleEditSubmit : handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {/* Increased gap */}

              {/* Category Name */}
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> {/* Standard label */}
                  Category Name*
                </label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm" // Standard input style
                />
              </div>

              {/* Parent Category */}
              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Category
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm" // Standard select style
                >
                  <option value="">— None (Top Level) —</option>
                  {/* Render options based on V1/V2 logic */}
                    {parentCategoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {/* Add indentation for V2 nested options */}
                        {useV2Api() && category.level > 0 ? '—'.repeat(category.level) + ' ' : ''}
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3} // Slightly more rows
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm" // Standard textarea style
                ></textarea>
              </div>

              {/* Status Checkbox */}
              {/* Optional: Only show status toggle if relevant for the API version? */}
              <div className="md:col-span-2">
                <label htmlFor="status" className="flex items-center text-sm">
                  <input
                    id="status"
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" // Standard checkbox size
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Active</span> {/* Increased margin */}
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3"> {/* Increased spacing */}
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setCurrentCategory(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" // Standard cancel button
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.categoryName} // Basic validation example
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium" // Standard submit button
              >
                {isSubmitting ? (showEditForm ? "Updating..." : "Adding...") : (showEditForm ? "Update Category" : "Add Category")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List/Table */}
      {categories.length === 0 && !loading ? (
        <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No categories found.</h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 mb-4">Get started by adding your first category.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium" // Standard button
          >
            Add First Category
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg"> {/* Added shadow/ring for table container */}
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {/* Adjusted padding and text style */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Category Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Slug
                </th>
                 {/* Only show Parent Category column if relevant (e.g., for V2 or if subcategories exist) */}
                 { (useV2Api() || categories.some(c => c.isSubcategory)) && (
                     <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Parent Category
                     </th>
                 )}
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {/* Conditionally render based on API version */}
              {useV2Api() ? (
                <V2CategoriesRenderer
                  categories={categories}
                  parentId={null} // Start with top-level
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpand}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                   allCategories={categories} // Pass all categories for parent lookup
                />
              ) : (
                 // V1 Renderer Logic (Flat structure with one level of subcategories)
                categories.filter(cat => !cat.isSubcategory).map(category => (
                     <V1CategoryRow
                         key={category.id}
                         category={category}
                         subcategories={categories.filter(sub => sub.parentId === category.id && sub.isSubcategory)}
                         expandedCategories={expandedCategories}
                         toggleExpand={toggleExpand}
                         handleEdit={handleEdit}
                         handleDelete={handleDelete}
                     />
                 ))
              )}
            </tbody>
          </table>
           {/* Pagination below table if categories exist */}
           {categories.length > 0 && <PaginationControls />}
        </div>
      )}
    </div>
  );
}


// --- Helper Component for V1 Category Row ---
const V1CategoryRow = ({ category, subcategories, expandedCategories, toggleExpand, handleEdit, handleDelete }) => {
    const isExpanded = expandedCategories[category.id];
    const hasSubcategories = subcategories.length > 0;

    return (
        <React.Fragment>
            {/* Parent Row */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 align-middle"> {/* Use align-middle */}
                {/* Category Name */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                        {hasSubcategories ? (
                            <button
                                onClick={() => toggleExpand(category.id)}
                                className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0.5 rounded" // Added padding/rounding
                                aria-expanded={isExpanded}
                                aria-controls={`subcat-panel-${category.id}`}
                            >
                                <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-4 mr-2 inline-block"></span> // Placeholder for alignment
                        )}
                        {category.name}
                    </div>
                </td>
                {/* Slug */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {category.slug}
                </td>
                 {/* Parent Category (Always '-' for V1 top-level) */}
                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                     -
                 </td>
                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ // Standardized badge style
                            category.status
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                        }`}
                    >
                        {category.status ? 'Active' : 'Inactive'}
                    </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3"> {/* Increased spacing */}
                        <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-700" // Added padding/hover bg
                            title="Edit Category"
                        >
                             <span className="sr-only">Edit {category.name}</span>
                            <Edit className="w-4 h-4" /> {/* Consistent icon size */}
                        </button>
                        <button
                            onClick={() => handleDelete(category.id, false)} // isSubcategory is false
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-gray-700" // Added padding/hover bg
                            title="Delete Category"
                        >
                             <span className="sr-only">Delete {category.name}</span>
                            <Trash2 className="w-4 h-4" /> {/* Consistent icon size */}
                        </button>
                    </div>
                </td>
            </tr>

            {/* Subcategory Rows (if expanded and exist) */}
            {isExpanded && hasSubcategories && (
                 // Optional: Add transition effect
                subcategories.map(subcat => (
                    <tr key={subcat.id} id={`subcat-panel-${category.id}`} className="bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-600/50 align-middle">
                         {/* Subcategory Name (indented) */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                            <div className="pl-8 flex items-center">{/* Indentation via padding */}
                               <span className="text-gray-400 dark:text-gray-500 mr-1.5">—</span> {subcat.name}
                            </div>
                        </td>
                         {/* Subcategory Slug */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {subcat.slug}
                        </td>
                         {/* Parent Category Name */}
                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                             {category.name} {/* Show parent name */}
                         </td>
                         {/* Subcategory Status */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    subcat.status
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                }`}
                            >
                                {subcat.status ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                         {/* Subcategory Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-3">
                                <button
                                    onClick={() => handleEdit(subcat)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-600"
                                    title="Edit Subcategory"
                                >
                                     <span className="sr-only">Edit {subcat.name}</span>
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(subcat.id, true)} // isSubcategory is true
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-gray-600"
                                    title="Delete Subcategory"
                                >
                                     <span className="sr-only">Delete {subcat.name}</span>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
        </React.Fragment>
    );
};


// --- Helper Component for V2 Recursive Categories ---
const V2CategoriesRenderer = ({
    categories,         // The relevant subset of categories to render at this level/branch
    parentId,           // The ID of the parent for the current level (null for root)
    expandedCategories,
    toggleExpand,
    handleEdit,
    handleDelete,
    allCategories,      // Pass the complete list for looking up parent names
    level = 0           // Current nesting level
}) => {

    // Filter categories that belong to the current parentId
    const currentLevelCategories = categories.filter(cat => {
        // Handle top-level categories (parentId is null or '0' from API)
        if (parentId === null) {
            return cat.parentId === null || cat.parentId === "0";
        }
        // Handle nested categories
        return cat.parentId === parentId;
    });

    // If no categories at this level, don't render anything
    if (currentLevelCategories.length === 0) {
        return null;
    }

     // Find the parent category's name (only needed if not top-level)
     const parentCategoryName = parentId ? allCategories.find(c => c.id === parentId)?.name : '-';

    return (
        <>
            {currentLevelCategories.map(category => {
                const isExpanded = expandedCategories[category.id];
                // Determine if a category *can* have children based on API data or if children exist in the full list
                 const hasChildren = category.hasChildren || categories.some(c => c.parentId === category.id);

                return (
                    <React.Fragment key={category.id}>
                        <tr className={`${level > 0 ? 'bg-gray-50 dark:bg-gray-700/40' : 'bg-white dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-600/50 align-middle`}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                <div className="flex items-center" style={{ paddingLeft: `${level * 1.5}rem` }}> 
                                    {hasChildren ? (
                                        <button
                                            onClick={() => toggleExpand(category.id)}
                                            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0.5 rounded"
                                             aria-expanded={isExpanded}
                                             aria-controls={`subcat-panel-v2-${category.id}`}
                                        >
                                             <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    ) : (
                                        <span className="w-5 mr-2 inline-block"></span> 
                                    )}
                                    {category.name}
                                </div>
                            </td>
                             {/* Slug */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {category.slug}
                            </td>
                             {/* Parent Category Name */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                 {parentCategoryName}
                             </td>
                             {/* Status */}
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        category.status
                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                    }`}
                                >
                                    {category.status ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                             {/* Actions */}
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end items-center space-x-3">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-700"
                                        title={`Edit ${category.name}`}
                                    >
                                         <span className="sr-only">Edit {category.name}</span>
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.parentId !== null && category.parentId !== "0")} // Determine if it's a subcategory
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-100 dark:hover:bg-gray-700"
                                        title={`Delete ${category.name}`}
                                    >
                                         <span className="sr-only">Delete {category.name}</span>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>

                        {/* Recursively render children if expanded and children exist */}
                        {isExpanded && hasChildren && (
                             // Pass only the relevant subset of categories (all descendants) for the next level
                             // and the full list for lookups
                            <V2CategoriesRenderer
                                categories={categories} // Pass the full list down
                                parentId={category.id} // Set the current category as the parent for the next level
                                expandedCategories={expandedCategories}
                                toggleExpand={toggleExpand}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                allCategories={allCategories} // Pass the full list again
                                level={level + 1}       // Increment level
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};