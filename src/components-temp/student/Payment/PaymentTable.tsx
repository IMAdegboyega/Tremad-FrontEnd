'use client'

import { Button } from '@/components/ui/button';
import { getStatusColor, getStatusDot, paymentHistory, schoolFees, supplementaryFees } from '@/Constants/Payment';
import { Download, FileText } from 'lucide-react';
import React, { useState } from 'react'

/**
 * PaymentTable Component
 * 
 * A comprehensive payment management interface that displays different types of fees
 * and payment history in both desktop table format and mobile card format.
 * 
 * Features:
 * - Tabbed interface for School Fees, Supplementary Fees, and Payment History
 * - Responsive design with different layouts for mobile and desktop
 * - Payment status indicators and action buttons
 * - Download receipt functionality for payment history
 */
const PaymentTable = () => {
  // State for managing the active tab (school-fees, supplementary, or history)
  const [activeTab, setActiveTab] = useState<'school-fees' | 'supplementary' | 'history'>('school-fees');
  
  // State for showing payment success modal (currently unused but ready for implementation)
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /**
   * Returns the appropriate data array based on the currently active tab
   * @returns Array of fee/payment data corresponding to the active tab
   */
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

  // Get current data and check if there's any data to display
  const currentData = getCurrentData();
  const hasData = currentData.length > 0;

  return (
    <div>
      {/* Tab Navigation Section */}
      <div className='space-y-4'>
        {/* Tab Container with responsive design */}
        <div className='bg-white rounded-lg border border-gray-100'>
          <div className='flex gap-2 sm:gap-8 p-1'>
            {/* School Fees Tab */}
            <button
              onClick={() => setActiveTab('school-fees')}
              className={`py-2 text-xs sm:text-sm font-medium px-3 sm:p-4 rounded-lg transition-colors flex-1 sm:flex-initial ${
                activeTab === 'school-fees' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              School fees
            </button>
            {/* Supplementary Fees Tab */}
            <button
              onClick={() => setActiveTab('supplementary')}
              className={`py-2 text-xs sm:text-sm font-medium px-3 sm:p-4 rounded-lg transition-colors flex-1 sm:flex-initial ${
                activeTab === 'supplementary' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Supplementary fees
            </button>
            {/* Payment History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 sm:py-3 text-xs sm:text-sm font-medium px-3 sm:p-4 rounded-lg transition-colors flex-1 sm:flex-initial ${
                activeTab === 'history' 
                  ? 'text-green-900 bg-green-100' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Desktop Table View - Hidden on mobile screens */}
        <div className='overflow-x-auto rounded-lg bg-white border border-gray-100 hidden sm:block'>
          {!hasData ? (
            // Empty State: Displayed when no data is available
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
            // Data Table: Renders when data is available
            <table className='w-full'>
              <thead>
                <tr className='bg-white rounded-lg border-b border-gray-200'>
                  <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Title</th>
                  {/* Conditional table headers based on active tab */}
                  {activeTab === 'history' ? (
                    // Payment History table headers
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Amount</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Payment date</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Status</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Reference ID</th>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Action</th>
                    </>
                  ) : (
                    // School Fees and Supplementary Fees table headers
                    <>
                      <th className='text-left py-3 px-6 text-sm font-normal text-gray-600'>Description</th>
                      <th className='text-right py-3 px-6 text-sm font-normal text-gray-600'>Amount</th>
                      <th className='text-center py-3 px-6 text-sm font-normal text-gray-600'>Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Conditional table body rendering based on active tab */}
                {activeTab === 'history' ? (
                  // Payment History Table Rows
                  paymentHistory.map((item, index) => (
                    <tr key={item.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{item.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-900 font-medium'>{item.amount}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{item.paymentDate}</td>
                      <td className='py-4 px-6'>
                        {/* Status indicator with colored dot and text */}
                        <div className='flex items-center gap-2'>
                          <span className={`w-2 h-2 rounded-full ${getStatusDot(item.status!)}`} />
                          <span className={`text-sm ${getStatusColor(item.status!)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{item.referenceId}</td>
                      <td className='py-4 px-6'>
                        {/* Download receipt button */}
                        <Button variant="ghost" size="sm" className='text-green-700 hover:text-green-800'>
                          <Download size={14} className='mr-2' />
                          <span className='text-xs'>Download reciept</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'school-fees' ? (
                  // School Fees Table Rows
                  schoolFees.map((fee, index) => (
                    <tr key={fee.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{fee.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{fee.description}</td>
                      <td className='py-4 px-6 text-right text-sm font-medium text-gray-900'>{fee.amount}</td>
                      <td className='py-4 px-6 text-center'>
                        {/* Conditional rendering: Paid status or Pay button */}
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
                  // Supplementary Fees Table Rows
                  supplementaryFees.map((fee, index) => (
                    <tr key={fee.id} className='hover:bg-gray-50'>
                      <td className='py-4 px-6 text-sm text-gray-900'>{fee.title}</td>
                      <td className='py-4 px-6 text-sm text-gray-600'>{fee.description}</td>
                      <td className='py-4 px-6 text-right text-sm font-medium text-gray-900'>{fee.amount}</td>
                      <td className='py-4 px-6 text-center'>
                        {/* Conditional rendering: Paid status or Pay button */}
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

        {/* Mobile Card View - Only visible on mobile screens (sm:hidden) */}
        <div className='sm:hidden space-y-3'>
          {!hasData ? (
            // Mobile Empty State: Same as desktop but with mobile-specific styling
            <div className='py-16 bg-white rounded-lg border border-gray-100'>
              <div className='flex flex-col items-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                  <FileText className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-900 font-medium mb-1'>No fees allocated yet</p>
                <p className='text-sm text-gray-500'>Your fees will appear here</p>
              </div>
            </div>
          ) : (
            <>
              {/* School Fees and Supplementary Fees Mobile Cards */}
              {(activeTab === 'school-fees' || activeTab === 'supplementary') && 
                (activeTab === 'school-fees' ? schoolFees : supplementaryFees).map((fee) => (
                  <div key={fee.id} className='bg-white rounded-xl p-5 space-y-4'>
                    <h3 className='text-base font-semibold text-gray-900'>{fee.title}</h3>
                    <p className='text-sm text-gray-600 leading-relaxed'>{fee.description}</p>
                    <div className='flex items-center justify-between pt-2'>
                      <span className='text-lg font-bold text-gray-900'>{fee.amount}</span>
                      {/* Conditional rendering: Paid status or Pay button */}
                      {fee.isPaid ? (
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 bg-green-600 rounded-full'></span>
                          <span className='text-sm font-medium text-green-600'>Paid</span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          className='bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 h-auto rounded-lg font-medium'
                          onClick={() => setShowSuccessModal(true)}
                        >
                          Pay now →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

              {/* Payment History Mobile Cards */}
              {activeTab === 'history' && paymentHistory.map((item) => (
                <div key={item.id} className='bg-white rounded-xl p-5 space-y-4'>
                  {/* Payment details in key-value pairs */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Title:</span>
                      <span className='text-sm font-medium text-gray-900'>{item.title}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Payment date:</span>
                      <span className='text-sm font-medium text-gray-900'>{item.paymentDate}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Status:</span>
                      {/* Status with colored indicator */}
                      <div className='flex items-center gap-2'>
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(item.status!)}`} />
                        <span className={`text-sm font-medium ${getStatusColor(item.status!)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Amount:</span>
                      <span className='text-sm font-bold text-gray-900'>{item.amount}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600'>Reference ID:</span>
                      <span className='text-sm font-medium text-gray-900'>{item.referenceId}</span>
                    </div>
                  </div>
                  {/* Full-width download button */}
                  <Button 
                    variant="ghost" 
                    className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 h-auto py-3 rounded-lg font-medium flex items-center justify-center gap-2'
                    onClick={() => {/* Handle download */}}
                  >
                    <Download size={16} />
                    Download reciept
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentTable