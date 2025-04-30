
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EarningsCard = () => {
  const [tab, setTab] = useState("daily");
  
  // Sample data for the charts
  const dailyData = [
    { name: '00:00', value: 15 },
    { name: '04:00', value: 25 },
    { name: '08:00', value: 40 },
    { name: '12:00', value: 30 },
    { name: '16:00', value: 55 },
    { name: '20:00', value: 70 },
    { name: '23:59', value: 60 }
  ];
  
  const weeklyData = [
    { name: 'Mon', value: 150 },
    { name: 'Tue', value: 230 },
    { name: 'Wed', value: 180 },
    { name: 'Thu', value: 290 },
    { name: 'Fri', value: 320 },
    { name: 'Sat', value: 210 },
    { name: 'Sun', value: 250 }
  ];
  
  const monthlyData = [
    { name: 'Week 1', value: 1200 },
    { name: 'Week 2', value: 1400 },
    { name: 'Week 3', value: 1800 },
    { name: 'Week 4', value: 1600 }
  ];
  
  // Get the appropriate data and total based on the selected tab
  const getTabData = () => {
    switch (tab) {
      case 'daily':
        return { 
          data: dailyData, 
          total: dailyData.reduce((sum, item) => sum + item.value, 0) / 10
        };
      case 'weekly':
        return { 
          data: weeklyData, 
          total: weeklyData.reduce((sum, item) => sum + item.value, 0) / 10
        };
      case 'monthly':
        return { 
          data: monthlyData, 
          total: monthlyData.reduce((sum, item) => sum + item.value, 0) / 10
        };
      default:
        return { data: dailyData, total: 0 };
    }
  };
  
  const { data, total } = getTabData();
  
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
          </Tabs>
        </div>
      </CardHeader>
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
          <p className="text-sm text-corepulse-gray-600">Total {tab} earnings</p>
          <p className="text-2xl font-bold">{total.toFixed(2)} $CORE</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsCard;
