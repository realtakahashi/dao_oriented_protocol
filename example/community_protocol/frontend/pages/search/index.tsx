import { useState } from "react";
import CommunitySearchResult from "../../components/CommunitySearchResult";

const Search = () => {
  const [searchResult,setSearchResult] = useState(false);
  const [searchText, setSearchText] = useState("");
  const showSearchResult = () => {
    setSearchResult(true);
  }
  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="text-center text-60px font-extrabold leading-none tracking-tight">
          <div className="p-3 m-5"></div>
          <span className="bg-clip-text text-indigo-400">Community Search</span>
        </div>
        <div className="m-5"></div>
        <div className="text-center">
          <input
            className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            name="title"
            type="text"
            onChange={onChangeInput}
          ></input>
                <button
                  className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
                  onClick={() => showSearchResult()}
                >
                  Search
                </button>
        </div>
        {searchResult == true && (
          <>
            <CommunitySearchResult searchWord={searchText}></CommunitySearchResult>
          </>
        )};
      </div>
    </>
  );
};

export default Search;
