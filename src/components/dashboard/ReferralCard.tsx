
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ReferralCard = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://corepulse.io/ref/user123";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="referral-link" className="text-sm text-corepulse-gray-600 mb-1">
              Your Referral Link
            </label>
            <div className="flex">
              <Input 
                id="referral-link"
                value={referralLink}
                readOnly
                className="rounded-r-none"
              />
              <Button 
                onClick={copyToClipboard} 
                className={`rounded-l-none ${
                  copied ? "bg-green-500 hover:bg-green-600" : "bg-corepulse-orange hover:bg-corepulse-orange-hover"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-corepulse-gray-600">Referred Users</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-corepulse-gray-600">Bonus Earned</p>
              <p className="text-2xl font-bold">24.5 $CORE</p>
            </div>
          </div>
          
          <div className="bg-corepulse-gray-100 p-3 rounded-md">
            <p className="text-sm text-corepulse-gray-700">
              <span className="font-semibold">Earn 5% of your referrals' earnings!</span> Share your link with friends to grow your network and increase your mining power.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
