import { ApiError } from "./ApiError";


const paginate = async (model, page = 1, limit = 50, query = {}, sort = {}) => { 
    // Parse page and limit as integers, with default values if not provided
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;
  
    // Validate the sort object, ensure it only contains valid field names and directions
    if (sort && typeof sort !== "object") {
      throw new ApiError(400, "Sort parameter must be an object");
    }
  
    // Calculate the number of documents to skip (page - 1) * limit
    const skip = (page - 1) * limit;
  
    try {
      // Fetch the paginated results with optional query filters and sorting
      const data = await model.find(query) // Add any additional filters with query (optional)
        .skip(skip)    // Skip the first (page - 1) * limit results
        .limit(limit)  // Limit the number of results per page
        .sort(sort);   // Sort results based on the sort object (e.g., { fieldName: 'asc' })
  
      // Get the total count of documents for pagination info
      const totalCount = await model.countDocuments(query);
  
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
  
      // Return paginated results and pagination metadata
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
        }
      };
    } catch (error) {
      throw new ApiError(400, error?.message || "Error in Pagination!!");
    }
  };
  
  export {paginate}
  