"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from 'react'
import { IoMdSearch } from "react-icons/io";

function Search() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    useEffect(() => {
        setSearch(() => searchParams.get("search") || "")
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("search", search);
        router.push(`${pathname}?${newSearchParams}`);
    }
  return (
    <form onSubmit={handleSearch} className="flex flex-row gap-4 w-full">
        <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        />
          <button
           type="submit"
           className="px-8 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 cursor-pointer">
              <IoMdSearch className="text-2xl" />
          </button>
    </form>
  )
}

export default Search
