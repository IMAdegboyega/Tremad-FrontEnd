'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useUser } from '@/Constants/UserContext';
import { Button } from '@/components/ui/button';
import AttendanceChart from '@/components/StudentChats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Attendance widget
 *
 * The backend does not yet expose a per-student attendance endpoint, so the
 * gauge renders with the empty-term scaffolding from UserContext (zeroed
 * values) and displays a small "not available yet" hint underneath.
 */
const Attendance = () => {
  const user = useUser();
  if (!user) return null;

  const termData = user.terms[user.term];
  const isLoading = user.loading && !user.profile;
  const hasData = !!termData && termData.attendance.maxValue > 0;

  return (
    <div>
      <div className='flex flex-col bg-white p-4 rounded-2xl w-full h-full text-black'>
        <div className='flex'>
          <h2>Attendance</h2>
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

        <div>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center pt-8 pb-8 space-y-3'>
              <Skeleton className='h-32 w-64 rounded-full' />
              <Skeleton className='h-4 w-24' />
            </div>
          ) : (
            <>
              <AttendanceChart
                value={termData.attendance.value}
                maxValue={Math.max(termData.attendance.maxValue, 1)}
                label={termData.attendance.label}
              />
              {!hasData && (
                <p className='text-xs text-gray-500 text-center -mt-4'>
                  Attendance data is not available yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
