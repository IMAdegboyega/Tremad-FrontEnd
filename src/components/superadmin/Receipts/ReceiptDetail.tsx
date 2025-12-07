'use client'

import React, { useRef } from 'react';
import { ChevronLeft, Printer, Download, Mail } from 'lucide-react';
import Image from 'next/image';
import { Receipt } from '@/app/SuperAdmin/(root)/[section]/sections/Receipts';

interface ReceiptDetailProps {
  receipt: Receipt;
  onBack: () => void;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ receipt, onBack }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Downloading receipt:', receipt.receiptNo);
  };

  const handleEmail = () => {
    // Implement email sending logic
    console.log('Emailing receipt:', receipt.receiptNo);
  };

  // Calculate total from items
  const total = receipt.items?.reduce((sum, item) => sum + item.amount, 0) || 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Receipt Details - {receipt.receiptNo}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively</p>
        </div>
      </div>

        {/* Receipt Template */}
        <div className="flex items-center justify-center mx-auto h-[842px] w-[630px]">
            <div
                ref={receiptRef}
                className="relative bg-white shadow-lg w-full max-w-2xl h-full flex flex-col overflow-hidden"
            >
                {/* Receipt Frame */}
                <Image
                    src="/icon/receiptframe.svg"
                    alt="receipt frame"
                    fill
                    className="pointer-events-none object-contain z-0"
                />

                {/* Receipt Content */}
                <div className="relative p-10 px-15 flex flex-col flex-1">
                    {/* Header with Logo */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-3">
                        <div className="relative">
                            <Image
                            src="/icon/receiptlogo.svg"
                            alt="Tremad Schools"
                            width={100}
                            height={80}
                            className="object-contain"
                            />
                        </div>
                        </div>
                        <h2 className="my-auto text-4xl font-semibold text-gray-900">
                        Payment Receipt
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {/* Receipt To Section */}
                        <div className="flex">
                        <div className="flex flex-col justify-center">
                            <p className="text-xs text-gray-500">Receipt to</p>
                            <p className="text-base font-semibold text-gray-900">
                            {receipt.studentName} ({receipt.studentId})
                            </p>
                        </div>

                        <div className="flex flex-col justify-center text-xs ml-auto text-gray-500">
                            <span>Transaction ID: {receipt.transactionId}</span>
                            <span>Date: {currentDate}</span>
                        </div>
                        </div>

                        <div className="flex items-center">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                            Grade: {receipt.grade}
                            </p>
                            <p className="text-xs text-gray-500">
                            Parent: {receipt.parent}
                            </p>
                        </div>

                        <div className="ml-auto space-y-1">
                            <p className="text-xs text-gray-500">
                            Status:{' '}
                            <span
                                className={
                                receipt.status === 'Paid'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }
                            >
                                {receipt.status}
                            </span>
                            </p>
                            <p className="text-xs text-gray-500">
                            Payment Method: {receipt.paymentMethod}
                            </p>
                        </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="my-8">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="border-y border-[#4BA983]">
                                <th className="py-3 text-xs font-semibold text-gray-700 text-left w-16">
                                NO.
                                </th>
                                <th className="py-3 text-xs font-semibold text-gray-700 text-center">
                                Description
                                </th>
                                <th className="py-3 text-xs font-semibold text-gray-700 text-right">
                                Amount
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {receipt.items?.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                <td className="py-4 text-sm text-gray-600 text-left">
                                    {index + 1}.
                                </td>
                                <td className="py-4 text-sm text-gray-600 text-center">
                                    {item.description}
                                </td>
                                <td className="py-4 text-sm text-gray-900 text-right">
                                    {formatCurrency(item.amount)}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="flex justify-end mb-8">
                        <div className="bg-[#EDF6F3] pl-30 px-6 py-3 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-lg font-semibold text-[#006437]">
                            ₦{formatCurrency(total)}
                        </span>
                        </div>
                    </div>

                    {/* Footer — pushed down */}
                    <div className="ml-auto text-end text-xs text-gray-500 border-t border-gray-100 flex flex-col justify-center">
                        <p className="font-medium">Received by: Admin User</p>
                        <p>Contact: finance@tremadschools.edu</p>
                    </div>

                    <div className="mt-auto border-t border-gray-100 py-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 max-w-2xl mx-auto px-8">
                            {/* Phone */}
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/icon/phone.svg"
                                    alt="phone"
                                    width={16}
                                    height={16}
                                />
                                <div className="flex flex-col">
                                    <span>08061178024</span>
                                    <span>08061178024</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/icon/location.svg"
                                    alt="location"
                                    width={16}
                                    height={16}
                                />
                                <div className="flex flex-col text-center">
                                    <span>lorem ipsum</span>
                                    <span>address lorem</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/icon/email.svg"
                                    alt="email"
                                    width={16}
                                    height={16}
                                />
                                <div className="flex flex-col">
                                    <span>info@tremad.</span>
                                    <span>comksn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Green Bottom Border */}
                <div className="h-[54px] bg-[#006437] z-20" />
            </div>
        </div>


      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <div className="text-left">
            <p className="font-medium">Print Receipt</p>
            <p className="text-xs text-gray-500">print locally</p>
          </div>
        </button>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <div className="text-left">
            <p className="font-medium">Download</p>
            <p className="text-xs text-gray-500">save locally</p>
          </div>
        </button>

        <button 
          onClick={handleEmail}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-4 h-4" />
          <div className="text-left">
            <p className="font-medium">Send Receipt</p>
            <p className="text-xs text-gray-500">email</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ReceiptDetail;