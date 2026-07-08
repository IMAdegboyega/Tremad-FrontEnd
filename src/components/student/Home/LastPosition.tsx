'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useUser } from '@/Constants/UserContext';
import { PositionChart } from '@/components/StudentChats';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * LastPosition widget
 *
 * Backend doesn't yet expose a class-position endpoint. Until it does,
 * the chart renders with UserContext's empty scaffolding ("—" rank) and
 * a helper note is shown beneath.
 */
const LastPosition = () => {
  const user = useUser();
  if (!user) return null;

  const termData = user.terms[user.term];
  const isLoading = user.loading && !user.profile;
  const hasData = !!termData && termData.position.rank !== '-';

  return (
    <div>
      <div className='flex flex-col bg-white p-4 rounded-2xl w-full text-black'>
        <div className='flex'>
          <h2>Last Position</h2>
          <div className='ml-auto'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='cursor-pointer'>
                  {user.term} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56'>
                <DropdownMenuRadioGroup
                  value={user.term}
                  onValueChange={(val) => user.setTerm(val)}
                >
                  <DropdownMenuRadioItem value='1st Term'>
                    1st Term
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='2nd Term'>
                    2nd Term
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='3rd Term'>
                    3rd Term
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <Skeleton className='h-40 w-40 rounded-full' />
          </div>
        ) : (
          <>
            <PositionChart
              rank={termData.position.rank}
              percentage={termData.position.percentage}
            />
            {!hasData && (
              <p className='text-xs text-gray-500 text-center -mt-4 pb-2'>
                Position data is not available yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LastPosition;
