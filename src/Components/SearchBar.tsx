import React from "react";
import { Search } from "lucide-react"; // lucide-react gives nice SVG icons

const SearchBar = () => {
  return (
    <div className="flex items-center w-full max-w-sm bg-white rounded-full px-4 py-2">
      {/* Search Icon */}
      <Search className="w-5 h-5 text-gray-400 mr-2" />

      {/* Input */}
      <input
        type="text"
        placeholder="Search..."
        className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
      />
    </div>
  );
};

export default SearchBar;
