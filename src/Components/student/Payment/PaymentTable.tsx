// file: src/Components/student/Payment/PaymentTable.tsx
'use client'

import { Button } from '@/Components/ui/button';
import { getStatusColor, getStatusDot, paymentHistory, schoolFees, supplementaryFees } from '@/Constants/Payment';
import { Download, FileText } from 'lucide-react';
import React, { useState } from 'react'

const PaymentTable = () => {
  const [activeTab, setActiveTab] = useState<'school-fees' | 'supplementary' | 'history'>('school-fees');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get the appropriate data based on active tab
  const getCurrentData = () => {
    switch(activeTab) {
      case 'school-fees':
        return schoolFees;
      case 'supplementary':
        return supplementaryFees;
      case 'history':
        return paymentHistory;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const hasData = currentData.length > 0;

  return (
    <div>
      {/* Tabs */}
      <div className='space-y-4'>
        <div className=' bg-white rounded-lg border border-gray-100'>
          <div className='flex gap-8 p-1'>
            <button
              onClick={() => setActiveTab('school-fees')}
              className={`py-2 text-sm font-medium p-4 rounded-lg transition-colors ${
                activeTab === 'school-fees' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              School fees
            </button>
            <button
              onClick={() => setActiveTab('supplementary')}
              className={`py-2 text-sm font-medium p-4 rounded-lg transition-colors ${
                activeTab === 'supplementary' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Supplementary fees
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 text-sm font-medium p-4 rounded-lg transition-colors ${
                activeTab === 'history' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className='overflow-x-auto rounded-lg bg-white border border-gray-100'>
          {!hasData ? (
            // Empty state
            <div className='py-16'>
              <div className='flex flex-col items-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                  <FileText className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-900 font-medium mb-1'>No fees allocated yet</p>
                <p className='text-sm text-gray-500'>Your fees will appear here</p>
              </div>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-white rounded-lg border-b border-gray-200'>
                  <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Title</th>
                  {activeTab === 'history' ? (
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Amount</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Payment date</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Status</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Reference ID</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Action</th>
                    </>
                  ) : (
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Description</th>
                      <th className='text-right py-3 px-6 text-sm font-normal text-gray-600'>Amount</th>
                      <th className='text-center py-3 px-6 text-sm font-normal text-gray-600'>Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'history' ? (
                  paymentHistory.map((item, index) => (
                    <tr key={item.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{item.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-900 font-medium'>{item.amount}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{item.paymentDate}</td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-2'>
                          <span className={`w-2 h-2 rounded-full ${getStatusDot(item.status!)}`} />
                          <span className={`text-sm ${getStatusColor(item.status!)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{item.referenceId}</td>
                      <td className='py-4 px-6'>
                        <Button variant="ghost" size="sm" className='text-green-700 hover:text-green-800'>
                          <Download size={14} className='mr-2' />
                          <span className='text-xs'>Download reciept</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'school-fees' ? (
                  schoolFees.map((fee, index) => (
                    <tr key={fee.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{fee.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{fee.description}</td>
                      <td className='py-4 px-6 text-right text-sm font-medium text-gray-900'>{fee.amount}</td>
                      <td className='py-4 px-6 text-center'>
                        {fee.isPaid ? (
                          <div className='flex items-center justify-center gap-1 text-green-600'>
                            <span className='w-2 h-2 bg-green-600 rounded-full'></span>
                            <span className='text-sm'>Paid</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className='bg-green-700 hover:bg-green-800 text-white px-6'
                            onClick={() => setShowSuccessModal(true)}
                          >
                            Pay now →
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  // Supplementary fees
                  supplementaryFees.map((fee, index) => (
                    <tr key={fee.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{fee.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{fee.description}</td>
                      <td className='py-4 px-6 text-right text-sm font-medium text-gray-900'>{fee.amount}</td>
                      <td className='py-4 px-6 text-center'>
                        {fee.isPaid ? (
                          <div className='flex items-center justify-center gap-1 text-green-600'>
                            <span className='w-2 h-2 bg-green-600 rounded-full'></span>
                            <span className='text-sm'>Paid</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className='bg-green-700 hover:bg-green-800 text-white px-6'
                            onClick={() => setShowSuccessModal(true)}
                          >
                            Pay now →
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentTable