import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="text"
        placeholder="Search or start new chat"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-whatsapp-header text-white text-sm rounded-lg focus:outline-none placeholder-gray-500 cursor-text"
      />
    </div>
  );
};

export default SearchBar;