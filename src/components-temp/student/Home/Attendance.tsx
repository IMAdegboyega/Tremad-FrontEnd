import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useUser } from '@/Constants/UserContext'
import { Button } from '@/components/ui/button'
import AttendanceChart from '@/components/StudentChats'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const Attendance = () => {

    const user = useUser();
    if (!user) return null;

    const termData = user.terms[user.term];

    return (
      <div>
          <div className='flex flex-col bg-white p-4 rounded-2xl w-full h-full text-black'>
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
      </div>
    )
}

export default Attendance