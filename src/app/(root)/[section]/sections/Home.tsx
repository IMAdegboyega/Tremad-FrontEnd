'use client'
import AttendanceChart, { PositionChart } from '@/Components/StudentChats';
import { useUser } from '@/Constants/UserContext';
import Image from 'next/image';
import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import React from 'react'
import { ChevronDown } from 'lucide-react';

const Home = () => {

  const [position, setPosition] = React.useState("bottom")

  const user = useUser();
  if (!user) return null;

  const termData = user.terms[user.term];

  return (
    <div className='flex gap-2 p-0.5 space-y-4'>
      <div className='gap-3 justify-between w-3xl space-y-3'>
        <div className='flex bg-gradient-to-r from-green-800 to-lime-400 rounded-2xl p-4 text-white'>
          <div className='flex flex-col items-start justify-center p-4 space-y-1'>
            <h1 className='text-4xl font-base'>Hi {user.firstName}!</h1>
            <span className='font-base text-gray-300'>{user.id}</span>
            <span className='font-base text-gray-300'>
              <p>{user.grade} {user.classCategory} {user.term}</p>
            </span>

            <h2 className='text-2xl font-base'>Welcome To TREMAD Schools Portal.</h2>
          </div>

          <div className='flex items-center justify-center ml-auto p-4'>
            <Image
              src={'/img/ladywriting.svg'}
              alt='penLady'
              width={100}
              height={100}
            />
          </div>
        </div>

        <div className='flex gap-3'>
          <div className='flex flex-col bg-white p-4 rounded-2xl w-1/2 text-black'>
            <div className='flex'>
              <h2>Attendance</h2>

              <div className='ml-auto'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='cursor-pointer'>
                      {user.term} <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={user.term}
                      onValueChange={(val) => user.setTerm(val)}
                    >
                      <DropdownMenuRadioItem value="1st Term">1st Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2nd Term">2nd Term</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3rd Term">3rd Term</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
 
              
            </div>

            <div>
              <AttendanceChart
                value={termData.attendance.value}
                maxValue={termData.attendance.maxValue}
                label={termData.attendance.label}
              />
            </div>
          </div>
          <div className='flex flex-col bg-white p-4 rounded-2xl w-1/2 text-black'>
            <div className='flex'>
                <h2>Last Position</h2>

                <div className='ml-auto'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className='cursor-pointer'>
                        {user.term} <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuRadioGroup
                        value={user.term}
                        onValueChange={(val) => user.setTerm(val)}
                      >
                        <DropdownMenuRadioItem value="1st Term">1st Term</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="2nd Term">2nd Term</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="3rd Term">3rd Term</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            <PositionChart
              rank={termData.position.rank}
              percentage={termData.position.percentage}
            />
          </div>
        </div>

        <div>
          <div>
            <h2>
              Current Subjects
            </h2>

            <div
              className='text'
            >
              View all
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div>
            calendar
          </div>
          <div>
            upcoming activities
          </div>
        </div>

        <div>
          notifications
        </div>
      </div>
    </div>
  )
}

export default Home