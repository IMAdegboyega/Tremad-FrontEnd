'use client'

import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import { useUser } from "@/Constants/UserContext";


const ProfileCard = () => {

  const user = useUser();
  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Make the whole thing clickable */}
        <button className="flex items-center space-x-3 cursor-pointer focus:outline-none">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          {/* Name & ID */}
          <div className="flex flex-col leading-tight text-left">
            <span className="text-base font-semibold text-gray-900">{user.name}</span>
            <span className="text-base text-gray-500">{user.id}</span>
          </div>

          {/* Dropdown Icon */}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="flex w-56 h-65 p-4 items-center justify-center rounded-3xl">
        <div className="flex flex-col items-center text-center space-y-2">

          <div className="w-24 h-24 rounded-full overflow-hidden">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={100}
              height={100}
              className="object-cover"
            />
          </div>
          

          <h2 className="text-lg font-semibold text-black">{user.name}</h2>
          <span className="text-base text-gray-600">{user.id}</span>

          {(user.grade || user.term) && (
            <p className="text-base text-gray-400">
              {user.grade} {user.term}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileCard;
