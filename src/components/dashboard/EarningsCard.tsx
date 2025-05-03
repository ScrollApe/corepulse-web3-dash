
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useEarningsData } from '@/hooks/useEarningsData';

const EarningsCard = () => {
  const [tab, setTab] = useState("daily");
  const { earningsData, loading } = useEarningsData();
  
  // Get the appropriate data based on the selected tab
  const getTabData = () => {
    switch (tab) {
      case 'daily':
        return earningsData.daily;
      case 'weekly':
        return earningsData.weekly;
      case 'monthly':
        return earningsData.monthly;
      default:
        return earningsData.daily;
    }
  };
  
  // Calculate total for current view
  const calculateTotal = () => {
    const data = getTabData();
    return data.reduce((sum, item) => sum + item.value, 0);
  };
  
  return (
    <Card className="border-2 h-full">
      <CardHeader>
        <CardTitle>Earnings Summary</CardTitle>
        <div className="pt-2">
          <Tabs defaultValue="daily" value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            {loading ? (
              <div className="mt-4">
                <Skeleton className="h-64 w-full" />
                <div className="mt-4 text-center">
                  <Skeleton className="h-4 w-1/3 mx-auto mb-2" />
                  <Skeleton className="h-6 w-1/4 mx-auto" />
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="daily">
                  <ChartContent data={earningsData.daily} total={calculateTotal()} period="daily" />
                </TabsContent>
                <TabsContent value="weekly">
                  <ChartContent data={earningsData.weekly} total={calculateTotal()} period="weekly" />
                </TabsContent>
                <TabsContent value="monthly">
                  <ChartContent data={earningsData.monthly} total={calculateTotal()} period="monthly" />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </CardHeader>
    </Card>
  );
};

interface ChartContentProps {
  data: { name: string; value: number }[];
  total: number;
  period: string;
}

const ChartContent: React.FC<ChartContentProps> = ({ data, total, period }) => {
  return (
    <CardContent>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#FFA500" 
              fill="rgba(255, 165, 0, 0.2)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-corepulse-gray-600">Total {period} earnings</p>
        <p className="text-2xl font-bold">{total.toFixed(2)} $CORE</p>
      </div>
    </CardContent>
  );
};

export default EarningsCard;
