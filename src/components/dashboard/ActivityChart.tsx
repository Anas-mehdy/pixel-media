import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { name: "السبت", messages: 45 },
  { name: "الأحد", messages: 52 },
  { name: "الإثنين", messages: 78 },
  { name: "الثلاثاء", messages: 61 },
  { name: "الأربعاء", messages: 89 },
  { name: "الخميس", messages: 72 },
  { name: "الجمعة", messages: 35 },
];

export function ActivityChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          النشاط خلال آخر 7 أيام
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(160, 10%, 45%)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(160, 15%, 90%)' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(160, 10%, 45%)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(160, 15%, 90%)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(160, 15%, 90%)',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
                labelStyle={{ color: 'hsl(160, 10%, 10%)' }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMessages)"
                name="الرسائل"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}